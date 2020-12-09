const faker = require('faker/locale/en_US');
const jsforce = require('jsforce');
const fs = require('fs');


let howMany = 1;

let contacts = [];

let createdContactId = [];

function getDay(start, end) {
    let someDay = faker.date.between(start, end);
    let d = new Date(someDay),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function createContacts() {
    for (i = 0; i < howMany; i++) {

        let contact = {
            LastName: faker.name.lastName(),
            FirstName: faker.name.firstName(),
            Salutation: faker.random.arrayElement([
                'Mr.',
                'Ms.',
                'Mrs.',
                'Dr.',
                'Prof.'
            ]),
            MailingState: faker.address.state(),
            MailingCountry: 'United States',
            Phone: faker.phone.phoneNumberFormat(),
            Email: faker.internet.email(),
            Title: faker.name.jobTitle(),
            Birthdate: getDay('01/01/1955', '1/01/2002'),
        };

        contacts.push(contact);
    }
};


function writeToFile() {

    const ids = JSON.stringify(createdContactId);

    let date = new Date();
    let generatedTimeStamp = `${date.getFullYear()}.${(date.getMonth() + 1)}.${date.getDate()}.${date.getHours()}.${date.getMinutes()}.${date.getSeconds()}`;

    fs.writeFile(`${generatedTimeStamp}-contact.json`, ids, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });

}

function syncRecords() {
    let conn = new jsforce.Connection();
    conn.login('your@email.com', 'password+securitytoken', function (err, res) {
        if (err) { return console.error(err); }
        conn.bulk.pollTimeout = 25000;
        conn.bulk.load("Contact", "insert", contacts, function (err, rets) {
            if (err) { return console.error(err); }
            for (let i = 0; i < rets.length; i++) {
                if (rets[i].success) {
                    createdContactId.push(rets[i].id);
                } else {
                }
            }
            writeToFile();
        });
    });
}


createContacts();
syncRecords();

