import express from "express";
import { parseGet } from "../middlewares/parse_get";
import { parsePost } from "../middlewares/parse_post";
import { parseDelete } from "../middlewares/parse_delete";
import { authenticateUser } from "../middlewares/auth";
import { modifyUserPath } from "../middlewares/modify_user_path";

export const router = express.Router();
export const prefix = '/user';

const { userStore } = require('../data/DataStore');

/**
 * Every request needs to be from a logged in user.
 * Modify path prefixes each request with the user's name.
 */
router.use([authenticateUser, modifyUserPath]);

router.get('/*', parseGet, function (req, res) {
  const result = req.handleGet(userStore);
  if (typeof result !== 'undefined') {
    res.send({ result })
  }
});

router.post('/*', parsePost, function (req, res) {
  const result = req.handlePost(userStore);
  if (typeof result !== 'undefined') {
    res.send({ result })
  }
});

router.delete('/*', parseDelete, function (req, res) {
  const result = req.handleDelete(userStore);
  if (typeof result !== 'undefined') {
    res.send({ result })
  }
});

router.get('/events', parseGet, function (req, res) {
  res.send(userStore.get(`events`));

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

  userStore.set(name, {
    title: req.body.name,
    datestart: req.body.datestart,
    dateend: req.body.dateend,
    notes: req.body.notes
    // image: req.body.image,
    // address: req.body.address,
    // description: req.body.description,
    // p: req.body.p,
    // comments: [],
  })

  res.send({
    status: "successfully created event"
  })

});

