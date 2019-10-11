const mongoose = require('mongoose')
const ObjectId = require('mongodb').ObjectId
const { connection } = mongoose
const express = require('express')
const bodyParser = require('body-parser')
const auth = require('../authenticate')

const movieRouter = express.Router()

movieRouter.use(bodyParser.json())

const size = 20

movieRouter
  .get('/movie', auth.checkJwt, async (req, res, next) => {
    try {
      let pageNo = parseInt(req.query.pageNo)

      if (!pageNo) {
        pageNo = 1
      }

      const totalCount = await connection.db
        .collection('movieDetails')
        .countDocuments({})

      const movies = await connection.db
        .collection('movieDetails')
        .find({}, { projection: { poster: 1, title: 1, year: 1 } })
        .skip(size * (pageNo - 1))
        .limit(size)
        .toArray()

      replaceHTTP(movies)

      const totalPages = Math.ceil(totalCount / size)

      response = {
        error: false,
        currentPage: pageNo,
        totalPages: totalPages,
        totalCount: totalCount,
        data: movies
      }
      res.json(response)
    } catch (err) {
      console.log(err)
    }
  })
  .get('/movie/:id', async (req, res, next) => {
    try {
      const movie = await connection.db.collection('movieDetails').findOne(
        { _id: new ObjectId(req.params.id) },
        {
          projection: {
            title: 1,
            poster: 1,
            plot: 1,
            director: 1,
            year: 1,
            genres: 1,
            countries: 1,
            writers: 1,
            actors: 1,
            'tomato.rating': 1
          }
        }
      )

      if (movie != null) {
        if (movie.poster != null)
          movie.poster = movie.poster.replace('http', 'https')

        response = { error: false, data: movie }
        res.json(response)
      } else {
        response = { error: true, message: 'movie id not found' }
        res.json(response)
      }
    } catch (err) {
      response = { error: true, message: 'Something went wrong. Try again' }
      res.json(response)
      console.log(err)
    }
  })
  .get('/movie/:id/countries', async (req, res, next) => {
    try {
      const movie = await connection.db
        .collection('movieDetails')
        .find(
          { _id: new ObjectId(req.params.id) },
          { projection: { _id: 0, countries: 1 } }
        )
        .toArray()

      if (movie != null) {
        response = { error: false, data: movie }
        res.json(response)
      } else {
        response = { error: true, message: 'movie id not found' }
        res.json(response)
      }
    } catch (err) {
      response = { error: true, message: 'Something went wrong. Try again' }
      res.json(response)
      console.log(err)
    }
  })
  .get('/movie/:id/writers', async (req, res, next) => {
    try {
      const movie = await connection.db
        .collection('movieDetails')
        .find(
          { _id: new ObjectId(req.params.id) },
          { projection: { _id: 0, writers: 1 } }
        )
        .toArray()

      if (movie != null) {
        response = { error: false, data: movie }
        res.json(response)
      } else {
        response = { error: true, message: 'movie id not found' }
        res.json(response)
      }
    } catch (err) {
      response = { error: true, message: 'Something went wrong. Try again' }
      res.json(response)
      console.log(err)
    }
  })

movieRouter.route('/writers').get(async (req, res, next) => {
  try {
    const movie = await connection.db
      .collection('movieDetails')
      .find({ writers: req.query.name }, { projection: { _id: 0, title: 1 } })
      .toArray()

    res.json(movie)
  } catch (err) {
    console.log(err)
    res.json('ERROR: ' + err)
  }
})

movieRouter.route('/search').post(async (req, res, next) => {
  try {
    let pageNo = parseInt(req.query.pageNo)
    if (!pageNo) {
      pageNo = 1
    }

    let { searchBy, search } = req.query
    // let { searchBy, search } = req.body
    const regex = new RegExp(search, 'i')

    if (searchBy === 'title' && search) {
      const count = await connection.db
        .collection('movieDetails')
        .countDocuments({ title: { $regex: regex } })

      const movies = await connection.db
        .collection('movieDetails')
        .find(
          { title: { $regex: regex } },
          { projection: { title: 1, poster: 1, year: 1 } }
        )
        .skip(size * (pageNo - 1))
        .limit(size)
        .toArray()

      replaceHTTP(movies)

      const totalPages = Math.ceil(count / size)
      const response = {
        error: false,
        currentPage: pageNo,
        totalPages: totalPages,
        totalCount: count,
        data: movies
      }
      res.json(response)
    } else if (searchBy === 'plot' && search) {
      const count = await connection.db
        .collection('movieDetails')
        .countDocuments({ plot: { $regex: regex } })

      const movies = await connection.db
        .collection('movieDetails')
        .find(
          { plot: { $regex: regex } },
          { projection: { title: 1, poster: 1, year: 1 } }
        )
        .skip(size * (pageNo - 1))
        .limit(size)
        .toArray()

      replaceHTTP(movies)

      const totalPages = Math.ceil(count / size)
      const response = {
        error: false,
        currentPage: pageNo,
        totalPages: totalPages,
        totalCount: count,
        data: movies
      }
      res.json(response)
    } else if (searchBy === 'actor' && search) {
      const count = await connection.db
        .collection('movieDetails')
        .countDocuments({ actors: { $regex: regex } })

      const movies = await connection.db
        .collection('movieDetails')
        .find(
          { actors: { $regex: regex } },
          { projection: { title: 1, poster: 1, year: 1 } }
        )
        .skip(size * (pageNo - 1))
        .limit(size)
        .toArray()

      replaceHTTP(movies)

      const totalPages = Math.ceil(count / size)
      response = {
        error: false,
        currentPage: pageNo,
        totalPages: totalPages,
        totalCount: count,
        data: movies
      }
      res.json(response)
    } else if (searchBy === 'all' && search) {
      const count = await connection.db
        .collection('movieDetails')
        .countDocuments({
          $or: [
            { title: { $regex: regex } },
            { plot: { $regex: regex } },
            { actors: { $regex: regex } }
          ]
        })

      const movies = await connection.db
        .collection('movieDetails')
        .find(
          {
            $or: [
              { title: { $regex: regex } },
              { plot: { $regex: regex } },
              { actors: { $regex: regex } }
            ]
          },
          { projection: { title: 1, poster: 1, year: 1 } }
        )
        .skip(size * (pageNo - 1))
        .limit(size)
        .toArray()

      replaceHTTP(movies)

      const totalPages = Math.ceil(count / size)
      const response = {
        error: false,
        currentPage: pageNo,
        totalPages: totalPages,
        totalCount: count,
        data: movies
      }
      res.json(response)
    } else {
      res.redirect('/movie')
    }
  } catch (err) {
    console.log(err)
    response = { error: true, message: 'Something went wrong. Try again' }
    res.json(response)
  }
})

movieRouter.route('/movie/sort/:sortBy').get(async (req, res, next) => {
  let pageNo = parseInt(req.query.pageNo)
  if (!pageNo) {
    pageNo = 1
  }

  try {
    if (req.params.sortBy === 'latest') {
      const count = await connection.db
        .collection('movieDetails')
        .countDocuments({})

      const movies = await connection.db
        .collection('movieDetails')
        .find({}, { projection: { title: 1, poster: 1, year: 1 } })
        .sort({ year: -1 })
        .skip(size * (pageNo - 1))
        .limit(size)
        .toArray()

      replaceHTTP(movies)

      const totalPages = Math.ceil(count / size)
      response = {
        error: false,
        currentPage: pageNo,
        totalPages: totalPages,
        totalCount: count,
        data: movies
      }
      res.json(response)
    } else if (req.params.sortBy === 'oldest') {
      const count = await connection.db
        .collection('movieDetails')
        .countDocuments({})

      const movies = await connection.db
        .collection('movieDetails')
        .find({}, { projection: { title: 1, poster: 1, year: 1 } })
        .sort({ year: 1 })
        .skip(size * (pageNo - 1))
        .limit(size)
        .toArray()

      replaceHTTP(movies)

      const totalPages = Math.ceil(count / size)
      response = {
        error: false,
        currentPage: pageNo,
        totalPages: totalPages,
        totalCount: count,
        data: movies
      }
      res.json(response)
    }
  } catch (err) {
    response = { error: true, message: 'Something went wrong. Try again' }
    res.json(err)
  }
})

movieRouter
  .route('/update/:id')
  .get(auth.checkJwt, async (req, res, next) => {
    try {
      const movie = await connection.db
        .collection('movieDetails')
        .findOne({ _id: new ObjectId(req.params.id) })

      if (movie != null) {
        response = { error: false, data: movie }
        res.json(response)
      } else {
        response = { error: true, message: 'movie id not found' }
        res.json(response)
      }
    } catch (err) {
      response = { error: true, message: 'Something went wrong. Try again' }
    }
  })
  .put(async (req, res, next) => {
    try {
      const movie = await connection.db
        .collection('movieDetails')
        .findOneAndUpdate(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body }
        )
      if (movie.value != null) {
        res.json({ status: 'Successfully updated', data: movie })
      } else {
        res.json({ error: true, message: 'movie id not found' })
      }
    } catch (err) {
      response = { error: true, message: 'Something went wrong. Try again' }
      res.json(response)
    }
  })

movieRouter.route('/delete/:id').delete(async (req, res, next) => {
  try {
    const movie = await connection.db
      .collection('movieDetails')
      .findOneAndDelete({ _id: new ObjectId(req.params.id) })
    if (movie.value != null) {
      response = { status: 'Successfully deleted', data: movie }
      res.json(response)
    } else {
      response = { error: true, message: 'movie id not found' }
      res.json(response)
    }
  } catch (err) {
    response = { error: true, message: 'Something went wrong. Try again' }
    res.json(res)
  }
})

function replaceHTTP(results) {
  results.forEach(result => {
    if (result.poster != null)
      result.poster = result.poster.replace('http', 'https')
  })
  return results
}

module.exports = movieRouter
