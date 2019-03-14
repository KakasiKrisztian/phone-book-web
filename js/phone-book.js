var persons = [];
var editId;

// TODO edit API url's & ACTION_METHODS
const API = {
    CREATE: "./api/add.json",
    READ: "./api/list.json",
    UPDATE: "./api/update.json",
    DELETE: "./api/delete.json"
};
const ACTION_METHODS = {
    CREATE: "GET",
    READ: "GET",
    UPDATE: "GET",
    DELETE: "GET"
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
            // save in persons as global variable
            window.persons = persons;
            PhoneBook.display(persons);
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
                PhoneBook.load();
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
                PhoneBook.load();
            }
        });
    },

    save: function(person) {
        $.ajax({
            url: API.UPDATE,
            method: ACTION_METHODS.UPDATE,
            data: person
        }).done(function (response) {
            if (response.success) {
                editId = '';
                PhoneBook.load();
            }
        });
    },

    bindEvents: function() {
        $('#phone-book tbody').delegate('a.edit', 'click', function () {
            var id = $(this).data('id');
            PhoneBook.edit(id);
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
                PhoneBook.save(person);
            } else {
                PhoneBook.add(person);
            }
        });

        document.getElementById('search').addEventListener('input', function(ev) {
            //const value = document.getElementById('search').value;
            const value = this.value;
            PhoneBook.search(value);
        });
    },

    edit: function (id) {
        // ES5 function systax inside find
        var editPerson = persons.find(function (person) {
            console.log(person.firstName);
            return person.id == id;
        });
        console.warn('edit', editPerson);

        if (editId) {
            const cancelBtn = `<button onclick="PhoneBook.cancelEdit(this)">Cancel</button>`;
            $('#phone-book tbody tr:last-child() td:last-child()').append(cancelBtn);
        }

        $('input[name=firstName]').val(editPerson.firstName);
        $('input[name=lastName]').val(editPerson.lastName);
        $('input[name=phone]').val(editPerson.phone);
        editId = id;
    },

    cancelEdit: function(button) {
        $( ".add-form" ).get(0).reset();
        editId = '';
        button.parentNode.removeChild(button);
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


// TODO update/remove/add items
//window.PhoneBookLocalActions = {}

console.info('loading persons');
PhoneBook.load();
PhoneBook.bindEvents();