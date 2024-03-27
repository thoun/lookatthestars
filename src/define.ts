define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter"
],
function (dojo, declare, gamegui, counter) {
    return declare("bgagame.lookatthestars", ebg.core.gamegui, new LookAtTheStars());
});