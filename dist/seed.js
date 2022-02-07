"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const mysql_1 = __importDefault(require("mysql"));
const logger_1 = __importDefault(require("./utils/logger"));
const connectionString = process.env.DATABASE_URL || '';
const connection = mysql_1.default.createConnection(connectionString);
connection.connect();
const getCharacterPageNames = () => __awaiter(void 0, void 0, void 0, function* () {
    const url = "https://throneofglass.fandom.com/wiki/Category:Kingdom_of_Ash_characters";
    const { data } = yield axios_1.default.get(url);
    const $ = cheerio_1.default.load(data);
    const categories = $('ul.category-page__members-for-char');
    const characterPageNames = [];
    for (let i = 0; i < categories.length; i++) {
        const ul = categories[i];
        const charactersLIs = $(ul).find('li.category-page__member');
        for (let j = 0; j < charactersLIs.length; j++) {
            const li = charactersLIs[j];
            const path = $(li).find('a.category-page__member-link').attr('href') || "";
            const name = path === null || path === void 0 ? void 0 : path.replace('/wiki/', "");
            characterPageNames.push(name);
        }
    }
    return characterPageNames;
});
const getCharacterInfo = (characterName) => __awaiter(void 0, void 0, void 0, function* () {
    const baseUrl = "https://throneofglass.fandom.com/wiki/";
    const { data } = yield axios_1.default.get(`${baseUrl}${characterName}`);
    const $ = cheerio_1.default.load(data);
    let name = $('h2[data-source="full name"]').text();
    const species = $('div[data-source="species"] > div.pi-data-value.pi-font').text();
    const image = $('.image.image-thumbnail > img').attr('src');
    if (!name) {
        name = characterName.replace("_", " ");
    }
    const characterInfo = {
        name, species, image
    };
    return characterInfo;
});
const loadCharacters = () => __awaiter(void 0, void 0, void 0, function* () {
    const characterPageNames = yield getCharacterPageNames();
    const characterInfoPromises = characterPageNames.map(characterName => getCharacterInfo(characterName));
    const characters = yield Promise.all(characterInfoPromises);
    const values = characters.map((character, i) => [i, character.name, character.species, character.image]);
    const sql = "INSERT INTO Characters (id, name, species, image) VALUES ?";
    connection.query(sql, [values], (err) => {
        if (err) {
            logger_1.default.error("Ahhh, it didn't work!");
            logger_1.default.error(err);
        }
        else {
            logger_1.default.info("The DB is populated! It worked!");
        }
    });
    // const characterInfoArr = [];
    // for (let i = 0; i < characterPageNames.length; i++) {
    //   const characterInfo = await getCharacterInfo(characterPageNames[i]);
    //   characterInfoArr.push(characterInfo);
    // }
    // logger.info(characterInfoArr);
});
// getCharacterPageNames();
loadCharacters();
