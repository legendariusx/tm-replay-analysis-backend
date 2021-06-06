const Joi = require('joi');

// Schema for replay query
const replayQuerySchema = Joi.object().keys({
    limit: Joi.number().required().max(50),
    fields: Joi.array().items(Joi.string().required()),
    uuid: Joi.array().items(Joi.string().required()),
    replayUID: Joi.array().items(Joi.string().required()),
    username: Joi.array().items(Joi.string().required()),
    gameVersion: Joi.array().items(Joi.string().required()),
    status: Joi.array().items(Joi.string().required()),
    createdAt: Joi.array().items(Joi.date().required()),
    createdAfter: Joi.date(),
    createdBefore: Joi.date()
}).required();

exports.replayQuerySchema = replayQuerySchema;