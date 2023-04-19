const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");


const url = "https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki"
const urlCharacter = "https://kimetsu-no-yaiba.fandom.com/wiki/"
// SETUP
const app = express();
app.use(bodyParser.json({ limit: "100mb" }));
app.use(cors());
dotenv.config();
app.use(
    bodyParser.urlencoded({
        limit: "100mb",
        extended: true,
        parameterLimit: 5000,
    })
);

// ROUTES

// GET DATA WEB

// Get all character
app.get("/v1", (req,resp) => {
    const character = [];
    const limit = Number(req.query.limit);
    try {
        // gửi request url
        axios(url).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            $(".portal", html).each(function() {
                const name = $(this).find("a").attr("title");
                const url = $(this).find("a").attr("href");
                const img = $(this).find("a > img").attr("data-src");
                character.push({
                    name: name,
                    url: "https://demon-slayer-api-53oa.onrender.com/v1" + url.split("/wiki")[1],
                    img: img
                })
            })
            // limit
            if (limit && limit > 0)
            {
                resp.status(200).json(character.slice(0, limit))

            } else {
                resp.status(200).json(character);
            }
        })
    } catch(err) {
        resp.status(500).json(err)
    }
})

// Get detail a character
app.get("/v1/:character", (req,resq) => {
    // console.log(req.params.character);
    const url = urlCharacter + req.params.character;
    const titles =[];
    const details = [];
    const character = [];
    const characterObj = {};
    const gallerys = []
    try {
        axios(url).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            // Get gallery 
            $(".wikia-gallery-item", html).each(function() {
                const gallery = $(this).find("a > img").attr("data-src")
                gallerys.push(gallery);
            })
            // Get titles
            $("aside", html).each(function() {
                const img = $(this).find("a > img").attr("src")
                $(this).find("section > div > h3").each(function() {
                    titles.push($(this).text())
                })
                // Get details
                $(this).find("section > div > div").each(function() {
                    details.push($(this).text())
                })
                if (img !== undefined) {
                    // Create obj with title as key and datails as value
                    for (let i = 0; i < titles.length; i++) {
                        characterObj[titles[i].toLowerCase()] = details[i];
                    }
                    character.push({
                        name: req.params.character.replace("_", " "),
                        image: img,
                        ...characterObj,
                        gallery: gallerys
                    })
                }
            })
            resq.status(200).json(character);
            // Get details
        })
    } catch(err) {
        resq.status(500).json(err)
    }
})
app.listen(process.env.PORT || 8000, () => {
    console.log("Server is running...");
})