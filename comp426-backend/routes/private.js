import express from "express";
import {
  parseGet
} from "../middlewares/parse_get";
import {
  parsePost
} from "../middlewares/parse_post";
import {
  parseDelete
} from "../middlewares/parse_delete";
import {
  authenticateUser
} from "../middlewares/auth";

export const router = express.Router();
export const prefix = '/private';

const {
  privateStore
} = require('../data/DataStore');

/**
 * Every request to this route needs
 * to be made from an authenticated user.
 */
router.use(authenticateUser);

router.get('/*', parseGet, function (req, res) {
  const result = req.handleGet(privateStore);
  if (typeof result !== 'undefined') {
    res.send({
      result
    })
  }
});

router.post('/*', parsePost, function (req, res) {
  const result = req.handlePost(privateStore);
  if (typeof result !== 'undefined') {
    res.send({
      result
    })
  }
});

router.delete('/*', parseDelete, function (req, res) {
  const result = req.handleDelete(privateStore);
  if (typeof result !== 'undefined') {
    res.send({
      result
    })
  }
});

router.get('/events', parseGet, function (req, res) {
  res.send(privateStore.get(`events`));
})

router.post('/events/*', function (req, res) {
  const name = req.body.name.toLowerCase();

  // let event = publicStore.get(`events.${name}`);
  // if (event) {
  //   res.status(401).send({
  //     msg: `Event '${req.body.name}' has already been created.`
  //   });
  //   return;
  // }

  privateStore.set(name, {
    title: req.body.name,
    datestart: req.body.datestart,
    dateend: req.body.dateend,
    image: req.body.image,
    address: req.body.address,
    description: req.body.description,
    p: req.body.p,
    comments: [],
  })

  res.send({
    status: "successfully created event"
  })

});