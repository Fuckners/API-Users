class HomeController {
    async index (req, res) {
        res.send('API EXPRESS! - Felipe Fuckner');
    }

    tokenValidate (req, res) {
        res.status(200);
        res.send('OK.');
    }
};

module.exports = new HomeController();