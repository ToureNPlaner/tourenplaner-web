// Uses jQuery.mockjax to mock the JSON REST API of the server

/**
 * Example API Mock using the /authuser function and the dummy user "Peter Lustig"
 */
$.mockjax({
    url: "/authuser",
    response: function(data) {
        if (_.isEqual(data.username, 'asd') && _.isEqual(data.password, 'asd')) {
            this.status = 200;
            this.responseText = {
                username: 'asd',
                password: 'asd',
                email: 'asd@asd.de',
                firstname: 'Peter',
                lastname: 'Lustig',
                admin: true
            }
        } else {
            this.status = 401;
            this.reponseText = 'Benutzername oder Passwort falsch';
        }
    }
});