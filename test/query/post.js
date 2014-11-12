
var fs = require('fs'),
    path = require('path'),
    should = require('should');
var purest = require('../../lib/provider'),
    providers = require('../../config/providers');
var image = path.resolve(__dirname, '../fixtures/cat.png'),
    audio = path.resolve(__dirname, '../fixtures/beep.mp3');


describe('post', function () {
    require('../utils/credentials');
    var cred = {
        app:require('../../config/app'),
        user:require('../../config/user')
    };
    var p = {};
    before(function () {
        for (var name in providers) {
            var provider = providers[name];
            p[name] = new purest(provider.__provider.oauth
                ? {provider:name, key:cred.app[name].key, secret:cred.app[name].secret}
                : {provider:name});
        }
    });

    it.skip('facebook', function (done) {
        p.facebook.post('me/feed', {
            qs:{access_token:cred.user.facebook.token},
            form:{message:'Sent on '+new Date()}
        },
        function (err, res, body) {
            debugger;
            if (err) return error(err, done);
            body.id.should.match(/\d+_\d+/);
            done();
        });
    });
    it('linkedin', function (done) {
        p.linkedin.query()
            .update('people/~/shares')
            .json({
                comment:'Sent on '+new Date(),
                visibility:{code:'anyone'}
            })
            .auth(cred.user.linkedin.token, cred.user.linkedin.secret)
            .request(function (err, res, body) {
                debugger;
                if (err) return error(err, done);
                body.updateKey.should.match(/^UPDATE-\d+-\d+$/);
                body.updateUrl.should.match(/^https:.*/);
                done();
            });
    });
    it.skip('mailgun', function (done) {
        p.mailgun.post(cred.user.mailgun.domain+'/messages', {
            auth:{user:'api',pass:cred.user.mailgun.apikey},
            form:{
                from:'purest@mailinator.com',
                to:'purest@mailinator.com,purest2@mailinator.com',
                subject:'Purest is awesome! (mailgun)',
                html:'<h1>Purest is awesome!</h1>',
                text:'True idd!'
            }
        },
        function (err, res, body) {
            debugger;
            if (err) return error(err, done);
            body.message.should.be.type('string');
            body.id.should.be.type('string');
            done();
        });
    });
    describe('mandrill', function () {
        it.skip('send', function (done) {
            p.mandrill.post('messages/send', {
                form:{
                    key:cred.user.mandrill.key,
                    message: {
                        from_email:'purest@mailinator.com',
                        to:[{email:'purest@mailinator.com'}, {email:'purest2@mailinator.com'}],
                        subject:'Purest is awesome! (mandrill)',
                        html:'<h1>Purest is awesome!</h1>',
                        text:'True idd!'
                    }
                }
            },
            function (err, res, body) {
                debugger;
                if (err) return error(err, done);
                should.deepEqual(Object.keys(body[0]), ['email','status','_id', 'reject_reason']);
                should.deepEqual(Object.keys(body[1]), ['email','status','_id', 'reject_reason']);
                done();
            });
        });
        it.skip('attachments', function (done) {
            // uses base64 instead of multipart
            p.mandrill.post('messages/send', {
                form:{
                    key:cred.user.mandrill.key,
                    message: {
                        from_email:'purest@mailinator.com',
                        to:[{email:'purest@mailinator.com'}, {email:'purest2@mailinator.com'}],
                        subject:'Purest is awesome! (mandrill+attachments)',
                        html:'<h1>Purest is awesome!</h1>',
                        text:'True idd!',
                        attachments:[{
                            type:'image/png',name:'cat.png',
                            content:fs.readFileSync(image).toString('base64')
                        }, {
                            type:'audio/mp3',name:'beep.mp3',
                            content:fs.readFileSync(audio).toString('base64')
                        }]
                    }
                }
            },
            function (err, res, body) {
                debugger;
                if (err) return error(err, done);
                should.deepEqual(Object.keys(body[0]), ['email','status','_id']);
                should.deepEqual(Object.keys(body[1]), ['email','status','_id']);
                done();
            });
        });
    });
    it.skip('sendgrid', function (done) {
        p.sendgrid.post('mail.send', {
            form:{
                api_user:cred.user.sendgrid.user,
                api_key:cred.user.sendgrid.pass,
                from:'purest@mailinator.com',
                to:['purest@mailinator.com','purest2@mailinator.com'],
                subject:'Purest is awesome! (sendgrid)',
                html:'<h1>Purest is awesome!</h1>',
                text:'True idd!'
            }
        },
        function (err, res, body) {
            debugger;
            if (err) return error(err, done);
            body.message.should.equal('success');
            done();
        });
    });
    it.skip('stocktwits', function (done) {
        p.stocktwits.post('messages/create', {
            qs:{access_token:cred.user.stocktwits.token},
            form:{body:'Sent on '+new Date()}
        },
        function (err, res, body) {
            debugger;
            if (err) return error(err, done);
            body.response.status.should.equal(200);
            should.deepEqual(Object.keys(body.message),
                ['id','body','created_at','user','source'])
            done();
        });
    });
    it.skip('twitter', function (done) {
        p.twitter.post('statuses/update', {
            oauth:{token:cred.user.twitter.token, secret:cred.user.twitter.secret},
            form:{status:'Sent on '+new Date()}
        },
        function (err, res, body) {
            debugger;
            if (err) return error(err, done);
            body.id.should.be.type('number');
            body.id_str.should.be.type('string');
            done();
        });
    });
});

function error (err, done) {
    return (err instanceof Error)
        ? done(err)
        : (console.log(err) || done(new Error('Network error!')));
}