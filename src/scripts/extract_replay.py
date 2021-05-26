#
#   Disclaimer: The majority of the content in this file was created by donadigo (donadigo#6525). Thank you for the great work!
#

from pygbx import Gbx, GbxType
from pygbx.headers import ControlEntry, CGameCtnGhost
from numpy import int32
import json
import sys
import os

# Prints error message as JSON quits
def error_exit(error):
    print(json.dumps({ 'status': 'failed', 'error': error }))
    quit()

# Strips string of all characters in tokens list
def strip_all(s, tokens):
    for tok in tokens:
        s = s.replace(tok, '')

    return s

# Tries to parse old ghosts
def try_parse_old_ghost(g):
    ghost = CGameCtnGhost(0)

    parser = g.find_raw_chunk_id(0x2401B00F)
    if parser:
        ghost.login = parser.read_string()

    parser = g.find_raw_chunk_id(0x2401B011)
    if parser:
        parser.seen_loopback = True
        g.read_ghost_events(ghost, parser, 0x2401B011)
        return ghost

    return None

# Determines whether keyboard or pad was used
def uses_binary_input(ghost):
    for entry in ghost.control_entries:
        if entry.event_name == 'Steer':
            return False
    
    return True

# Returns event time
def get_event_time(event):
    if event.event_name == 'Respawn':
        time = int(event.time / 10) * 10
        if event.time % 10 == 0:
            time -= 10
        return time
    else:
        return int(event.time / 10) * 10 - 10

# Finds end time of event
def find_event_end(control_entries, target_event, from_index):
    '''
    Even when finding the event ending, we do not discard immediate events such as Steer and Gas.
    If we find that there is an "ending" steer in a negative timestamp, we will discard that later
    in the main loop.
    '''
    for i in range(from_index, len(control_entries)):
        event = control_entries[i]
        if event.event_name == target_event.event_name:
            return event
    
    return None

# Determines whether event should be skipped
def should_skip_event(event):
    if event.event_name in ['AccelerateReal', 'BrakeReal']:
        return event.flags != 1

    if event.event_name == 'Steer':
        return False

    if event.event_name.startswith('_Fake'):
        return True
        
    return event.enabled == 0

# Converts event to analog value
def event_to_analog_value(event):
    val = int32((event.flags << 16) | event.enabled)
    val <<= int32(8)
    val >>= int32(8)
    return -val

# Extracts and formats inputs of pad ghost
def format_analog_inputs(ghost):
    is_iface = False
    invert_axis = False
    inputs = []

    for event in ghost.control_entries:
        if event.time % 10 == 5 and event.event_name == '_FakeIsRaceRunning':
            is_iface = True

        if event.event_name == '_FakeDontInverseAxis':
            invert_axis = True

    if is_iface:
        for i in range(len(ghost.control_entries)):
            ghost.control_entries[i].time -= 0xFFFF

    for i, event in enumerate(ghost.control_entries):
        if should_skip_event(event):
            continue

        is_unbound = False
        to_event = find_event_end(ghost.control_entries, event, i+1)
        if to_event is not None:
            _to = get_event_time(to_event)
        else:
            _to = ghost.race_time
            if _to == 4294967295:
                _to = -1
                is_unbound = True

        _from = get_event_time(event)

        if _from < 0:
            if _to < 0 and not is_unbound:
                # Does not affect anything in the race
                continue
            else:
                _from = 0

        # Always throw out the millisecond precision
        _from = int(_from / 10) * 10
        _to = int(_to / 10) * 10

        action = 'press'
        key = 'up'

        if event.event_name == 'Accelerate' or event.event_name == 'AccelerateReal':
            key = 'up'
        elif event.event_name == 'SteerLeft':
            key = 'left'
        elif event.event_name == 'SteerRight':
            key = 'right'
        elif event.event_name == 'Brake' or event.event_name == 'BrakeReal':
            key = 'down'
        elif event.event_name == 'Respawn':
            key = 'enter'
        elif event.event_name == 'Steer':
            action = 'steer'
            axis = event_to_analog_value(event)
            if invert_axis:
                axis = -axis

            inputs.append({ "timestamp": _from, "action": action, "axis": int(axis) })
            continue
        elif event.event_name == 'Gas':
            action = 'gas'
            axis = event_to_analog_value(event)
            if invert_axis:
                axis = -axis

            inputs.append({ "timestamp": _from, "action": action, "axis": int(axis) })
            continue
        elif event.event_name == 'Horn':
            continue

        if is_unbound:
            inputs.append({ "timestamp": _from, "action": action, "key": key })
            continue
        else:
            inputs.append({ "timestampStart": _from, "timestampStop": _to, "action": action, "key": key })
            continue

    return inputs

# Extracts ghost from replay file
def process_path(path):
    try:
        g = Gbx(path)
    except Exception as e:
        return False, f'Processing replay failed: {str(e)}'

    ghosts = g.get_classes_by_ids([GbxType.CTN_GHOST, GbxType.CTN_GHOST_OLD])
    if not ghosts:
        ghost = try_parse_old_ghost(g)
    else:
        ghost = ghosts[0]

    if not ghost:
        return False, 'Processing replay failed: Ghost could not be extracted.'

    if not ghost.control_entries:
        return False, 'Processing replay failed: No control entries found.'
    
    return True, ghost

def extract_replay(id, filename, path):
    replay = {
        'id': id,
        'filename': filename,
        'status': 'success'
    }

    success, result = process_path(path)

    if not success:
        replay['status'] = 'failed'
        replay['error'] = result
        return replay

    replay['username'] = result.login

    # I don't have any keyboard replays at hand so I'm currently unable to extract them properly
    if uses_binary_input(result):
        replay['status'] = 'failed'
        replay['error'] = 'Keyboard replays are currently not supported.'
        return replay

    replay['inputs'] = format_analog_inputs(result)
    replay['length'] = result.race_time
    replay['numOfRespawns'] = result.num_respawns
    replay['gameVersion'] = result.game_version
    replay['mapUID'] = result.uid

    return replay


def main():
    # If no file/path was provided, exit the program
    if len(sys.argv) < 2:
        error_exit('No path provided.')

    # Assigns path
    path = sys.argv[1]
    results = []
    # If path is a directory, iterate through all files
    if os.path.isdir(path):
        for root, _, files in os.walk(path):
            for i, filename in enumerate(files):
                lower = filename.lower()
                if lower.endswith('.gbx'):
                        results.append(extract_replay(i, filename, os.path.join(root, filename)))
    else:
        split_path = path.split('/')
        results.append(extract_replay(0, split_path[len(split_path) - 1], path))
    
    print(json.dumps(results))

if __name__ == "__main__":
    main()