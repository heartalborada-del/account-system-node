const express = require('express');

const {users} = require('../../utils/sql');

const router = express.Router();

router.get('/getAllUser', function (req, res) {
    if (!(req.auth)) {
        return res.json({
            code: -101,
            msg: 'Invalid params or permission denied',
        });
    }
    users.findOne({where:{uuid: req.auth.uuid}}).then(user => {
        if(user!=null){
            if(user.permission>=0) {
                users.findAll({
                    attributes: [
                        'UUID', 'email', 'email_verify',
                        'permission', 'createdAt', 'updatedAt'
                    ]
                }).then(function (users) {
                    return res.json(users);
                })
            } else {
                return res.json({
                    code: -101,
                    msg: 'Invalid params or permission denied',
                });
            }
        }
    })
})
module.exports = router;