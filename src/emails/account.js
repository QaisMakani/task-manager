const sgMail = require('@sendgrid/mail');

const sendgridAPIKey = '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';

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'qais.makani@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    });
};

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'qais.makani@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you sometime soon`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
};