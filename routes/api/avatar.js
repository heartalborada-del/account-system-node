const express = require('express');
const fs = require('fs');
const path = require("path");
const mime = require('mime');
const multiparty = require('multiparty');
const { promisify } = require('util');
const sizeOf = promisify(require('image-size'))

const router = express.Router();

const avatarPath = path.join(__dirname, '../../'+process.env.AVATAR_PATH);
const defaultPath = path.join(avatarPath, 'default.png');

router.get('/get', function (req, res) {
    let uuid = req.query.uuid || req.auth.uuid;
    let avatarPathU = path.join(avatarPath,uuid);
    fs.readFile(avatarPathU, (error, buffer) => {
        if (error) {
            res.setHeader("content-Type", mime.getType(defaultPath));
            res.send(fs.readFileSync(defaultPath));
            res.end();
        }
        else {
            res.setHeader("content-Type", mime.getType(avatarPathU));
            res.send(buffer);
            res.end();
        }
    })
});

router.post('/upload', function (req, res) {
    let form = new multiparty.Form({
        autoFiles: true,
        uploadDir: path.join(avatarPath,"/tmp"),
        maxFilesSize: 512*1024,
        encoding: 'utf-8'
    });
    fs.access(path.join(avatarPath,"/tmp"),function (err){
        if(err){
            fs.mkdirSync(path.join(avatarPath,"/tmp"))
        }
        form.parse(req, (err, fields, files) => {
            if(err)
                return res.json({code: -1,msg: err.message}).end();
            let newAvatarPath = files.files[0].path;
            let type = mime.getType(newAvatarPath);
            let acceptType = ['image/png','image/jpg','image/bmp']
            if(acceptType.includes(type)) {
                sizeOf(newAvatarPath).then(fi => {
                    if(fi.width === fi.height && fi.height<=512){
                        fs.readFile(newAvatarPath, (err,data) => {
                            if(err)
                                return res.json({code: -1,msg: err.message}).end();
                            fs.writeFile(path.join(avatarPath, req.auth.uuid), data , (err) => {
                                if(err)
                                    return res.json({code: -1,msg: err.message}).end();
                                for (let i = 0; i < files.files.length; i ++) {
                                    try {
                                        fs.unlinkSync(files.files[i].path);
                                    } catch (e) {}
                                }
                                return res.json({code: 0,msg: 'ok'}).end();
                            });
                        })
                    } else {
                        for (let i = 0; i < files.files.length; i ++) {
                            try {
                                fs.unlinkSync(files.files[i].path);
                            } catch (e) {}
                        }
                        return res.json({code: -1,msg: 'The image must be square and the width and height must be less than 512px'}).end();
                    }
                })
            } else {
                for (let i = 0; i < files.files.length; i ++) {
                    try {
                        fs.unlinkSync(files.files[i].path);
                    } catch (e) {}
                }
                return res.json({code: -1,msg: 'The image suffix must be png/jpg/bmp'}).end();
            }
        })
    })
});

module.exports = router;