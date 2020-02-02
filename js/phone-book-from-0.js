// window.PhoneBook2={
//     API_BASE_URL: "http://localhost:8081/agenda-contacts",
//
//     getRow: function(person) {
//         return `<tr>
//             <td>${person.firstName}</td>
//             <td>${person.lastName}</td>
//             <td>${person.phoneNumber}</td>
//             <td>
//                 <a href='#' data-id='${person.id}' class='delete'>&#10006;</a>
//                 <a href='#' data-id='${person.id}' class='edit'>&#9998;</a>
//             </td>
//         </tr>`;
//     },
//
//     getAgendaContacts: function () {
//         $.ajax({
//             url: PhoneBook2.API_BASE_URL,
//         }).done(function (response) {
//             console.log("Retrieved " + response);
//             PhoneBook2.displayAgendaContacts(response.content);
//
//
//         })
//
//     },
//
//     displayAgendaContacts: function (persons) {
//         let personsHtml = " ";
//
//         persons.forEach(onePerson => personsHtml += PhoneBook2.getRow(onePerson));
//
//         $('#phone-book tbody').html(personsHtml);
//
//     }
// };
// PhoneBook2.getAgendaContacts();
var persons = [];
var editId;

// TODO edit API url's & ACTION_METHODS
const API = {
    CREATE: "http://localhost:8081/agenda-contacts",
    READ: "http://localhost:8081/agenda-contacts",
    UPDATE: "http://localhost:8081/agenda-contacts",
    DELETE: "http://localhost:8081/agenda-contacts"
};
const ACTION_METHODS = {
    CREATE: "POST",
    READ: "GET",
    UPDATE: "PUT",
    DELETE: "DELETE"
};

window.PhoneBook = {
    getRow: function(person) {
        // ES6 string template
        return `<tr>
            <td>${person.firstName}</td>
            <td>${person.lastName}</td>
            <td>${person.phone}</td>
            <td>
                <a href='#' data-id='${person.id}' class='delete'>&#10006;</a>
                <a href='#' data-id='${person.id}' class='edit'>&#9998;</a>
            </td>
        </tr>`;
    },

    load: function () {
        $.ajax({
            url: API.READ,
            method: ACTION_METHODS.READ
        }).done(function (persons) {
            console.info('done:', persons);
            PhoneBookLocalActions.load(JSON.parse(persons));
            PhoneBook.display(JSON.parse(persons));
        });
    },

    delete: function(id) {
        $.ajax({
            url: API.DELETE,
            method: ACTION_METHODS.DELETE,
            data: {
                id: id
            }
        }).done(function (response) {
            if (response.success) {
                PhoneBookLocalActions.delete(id);
            }
        });
    },

    add: function(person) {
        $.ajax({
            url: API.CREATE,
            method: ACTION_METHODS.CREATE,
            data: person
        }).done(function (response) {
            if (response.success) {
                PhoneBook.cancelEdit();
                PhoneBookLocalActions.add(person);
            }
        });
    },

    update: function(person) {
        $.ajax({
            url: API.UPDATE,
            method: ACTION_METHODS.UPDATE,
            data: person
        }).done(function (response) {
            if (response.success) {
                PhoneBook.cancelEdit();
                PhoneBookLocalActions.update(person);
            }
        });
    },

    bindEvents: function() {
        $('#phone-book tbody').delegate('a.edit', 'click', function () {
            var id = $(this).data('id');
            PhoneBook.startEdit(id);
        });

        $('#phone-book tbody').delegate('a.delete', 'click', function () {
            var id = $(this).data('id');
            console.info('click on ', this, id);
            PhoneBook.delete(id);
        });

        $(".add-form").submit(function() {
            const person = {
                firstName: $('input[name=firstName]').val(),
                lastName: $('input[name=lastName]').val(),
                phone: $('input[name=phone]').val()
            };

            if (editId) {
                person.id = editId;
                PhoneBook.update(person);
            } else {
                PhoneBook.add(person);
            }
        });

        document.getElementById('search').addEventListener('input', function(ev) {
            //const value = document.getElementById('search').value;
            const value = this.value;
            PhoneBook.search(value);
        });
        document.querySelector('.add-form').addEventListener('reset', function(ev) {
            PhoneBook.search("");
        });
    },

    startEdit: function (id) {
        // ES5 function systax inside find
        var editPerson = persons.find(function (person) {
            console.log(person.firstName);
            return person.id == id;
        });
        console.debug('startEdit', editPerson);

        $('input[name=firstName]').val(editPerson.firstName);
        $('input[name=lastName]').val(editPerson.lastName);
        $('input[name=phone]').val(editPerson.phone);
        editId = id;
    },

    cancelEdit: function() {
        editId = '';
        document.querySelector(".add-form").reset();
    },

    display: function(persons) {
        var rows = '';

        // ES6 function systax inside forEach
        persons.forEach(person => rows += PhoneBook.getRow(person));

        $('#phone-book tbody').html(rows);
    },

    search: function (value) {
        value = value.toLowerCase();

        var filtered = persons.filter(function (person) {
            return person.firstName.toLowerCase().includes(value) ||
                person.lastName.toLowerCase().includes(value) ||
                person.phone.toLowerCase().includes(value);
        });

        PhoneBook.display(filtered);
    }
};


// ES6 functions
window.PhoneBookLocalActions = {
    load: (persons) => {
        // save in persons as global variable
        window.persons = persons;
    },
    // ES6 functions (one param - no need pharanteses for arguments)
    add: person => {
        person.id = new Date().getTime();
        persons.push(person);
        PhoneBook.display(persons);
    },
    delete: id => {
        var remainingPersons = persons.filter(person => person.id !== id);
        window.persons = remainingPersons;
        PhoneBook.display(remainingPersons);
    },
    update: person => {
        const id = person.id;
        var personToUpdate = persons.find(person => person.id === id);
        personToUpdate.firstName = person.firstName;
        personToUpdate.lastName = person.lastName;
        personToUpdate.phone = person.phone;
        PhoneBook.display(persons);
    }
}

console.info('loading persons');
PhoneBook.load();
PhoneBook.bindEvents();