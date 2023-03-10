import Joi from "joi";

export const addChildSchema = Joi.object({
  name: Joi.string().required(),
  gender: Joi.string().valid("male", "female").required(),
  lang: Joi.string().valid("ru-RU", "uk-UA").required(),
});
