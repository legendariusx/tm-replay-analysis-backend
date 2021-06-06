const Joi = require('joi');

const analyzeReplaySchema = Joi.object({
    // TODO: Add validation for replay objects inside array
    files: Joi.array().required(),
}).required();

exports.analyzeReplaySchema = analyzeReplaySchema;