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

export const router = express.Router();
export const prefix = '/public';

const {
  publicStore
} = require('../data/DataStore');


router.get('/*', parseGet, function (req, res) {
  const result = req.handleGet(publicStore);
  if (typeof result !== 'undefined') {
    res.send({
      result
    })
  }
});

router.post('/*', parsePost, function (req, res) {
  const result = req.handlePost(publicStore);
  if (typeof result !== 'undefined') {
    res.send({
      result
    })
  }
});

router.delete('/*', parseDelete, function (req, res) {
  const result = req.handleDelete(publicStore);
  if (typeof result !== 'undefined') {
    res.send({
      result
    })
  }
});

router.get('/events', parseGet, function (req, res) {
  res.send(publicStore.get(`events`));
})

router.post('/events/*', function (req, res) {
  const name = req.body.name.toLowerCase();

  let event = publicStore.get(`events.${name}`);
  if (event) {
    res.status(401).send({
      msg: `Event '${req.body.name}' has already been created.`
    });
    return;
  }

  publicStore.set(`${name}`, {
    data: {
      title: req.body.name,
      datestart: req.body.datestart,
      dateend: req.body.dateend,
      image: req.body.image,
      address: req.body.address,
      description: req.body.description,
      p: req.body.p,
      comments: [],
    }

  })

  res.send({
    status: "successfully created event"
  })

});


router.get('/events/*', parseGet, function (req, res) {
  res.send(publicStore.get(`events/*`));
})