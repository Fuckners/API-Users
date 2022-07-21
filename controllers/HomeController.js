class HomeController {
    async index (req, res) {
        res.send('API EXPRESS! - Felipe Fuckner');
    }
};

module.exports = new HomeController();