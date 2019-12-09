// import setToken from "./config/Token.js";
// import getAxiosInstance from "./config/Axios.js";

// const axios = getAxiosInstance('/account');
// console.log("hi");
// const axios = getAxiosInstance('/account');

function loadCreateAccount() {
    let target = $(this).parent();
    target.replaceWith(`<div class="logincontainer">
    <p class="labels">USERNAME</p>
    <input type="text" placeholder="Create a Username" class="unameinput" required>
    <p class="labels">PASSWORD</p>
    <input type="password" placeholder="Choose a Password" class="password" required>

    <button class="button createaccount" type="submit">CREATE ACCOUNT</button>
    <button class="button backtologin" type="submit">LOGIN</button>
    </div>`)

}

function backtoLogin() {
    let target = $(this).parent();
    target.replaceWith(`<div class="logincontainer">
    <p class="labels">USERNAME</p>
    <input type="text" placeholder="Enter Username" class="unameinput" required>
    <p class="labels">PASSWORD</p>
    <input type="password" placeholder="Enter Password" class="password" required>
    <button class="button loginsubmit" type="submit">LOGIN</button>
    <button class="button newuser" type="submit">NEW USER</button>
    </div>`)
}

function logout() {
    window.localStorage.removeItem("jwt");
}

async function createAccount() {
    let uname = $(this).parent().find(".unameinput").val();
    let pwd = $(this).parent().find(".password").val();
    let target = $(this).parent();

    try {
        let account = await axios({
            method: "POST",
            url: "http://localhost:3000/account/create",
            data: {
                name: uname,
                pass: pwd
            }
        });

        target.replaceWith(`<div class="logincontainer">
        <p class="labels">USERNAME</p>
        <input type="text" placeholder="Enter Username" class="unameinput" required>
        <p class="labels">PASSWORD</p>
        <input type="password" placeholder="Enter Password" class="password" required>
        <button class="button loginsubmit" type="submit">LOGIN</button>
        <button class="button newuser" type="submit">NEW USER</button>
        </div>`)
    } catch (e) {
        alert("Something went wrong! Please try again.");
    }
    return true;
}

async function login() {
    let uname = $(this).parent().find(".unameinput").val();
    let pwd = $(this).parent().find(".password").val();
    try {
        let account = await axios({
            method: "POST",
            url: "http://localhost:3000/account/login",
            data: {
                name: uname,
                pass: pwd
            }
        });

        window.localStorage.setItem("jwt", account.data.jwt);
        window.localStorage.setItem("loggedin", true);
        window.location.replace("index.html");
    } catch (e) {
        alert("Incorrect Username or Password");
    }

}

async function checkLoggedIn() {
    let jwt = window.localStorage.getItem("jwt");
    if (jwt == null) {
        jwt = "";
        window.localStorage.setItem("loggedin", false);
    } else {

        let status = await axios({
            method: 'GET',
            url: "http://localhost:3000/account/status",
            headers: {
                "Authorization": "Bearer " + jwt
            },
        })
        if (status.data.user.name != "") {
            window.localStorage.setItem("loggedin", true);
        } else {
            window.localStorage.setItem("loggedin", false);
        }
    }
}

let debounce = function (f, delay, now) {
    let timeout;
    return function () {
        let context = this;
        let later = function () {
            timeout = null;
            if (!now) {
                f.apply(context);
            }
        }
        let call = now && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, delay);
        if (call) {
            f.apply(context);
        }
    }

}

let searchevents = debounce(function () {
    let searchinput = $(this).val();
    let resultlist = $(this).parent().find(".results");
    let finallist = "";
    getResults(searchinput).then((results) => {
        if (results.length == 0) {
            resultlist.replaceWith(`<ul class='results'><li>No Matches</li></ul>`);
        } else if (results == "none") {
            resultlist.replaceWith(`<ul class='results'></ul>`);
        } else {
            results.forEach((result) => {
                finallist += `<li class=${result}>${result}</li>`;
            })
            resultlist.replaceWith(`<ul class='results'>${finallist}</ul>`);
        }
    });

}, 200);

async function getResults(searchinput) {
    let values = []
    let tagsarr = []

    if (window.localStorage.getItem("loggedin") == "true") {
        let jwt = window.localStorage.getItem("jwt");
        values = await axios({
            method: 'GET',
            url: "http://localhost:3000/private/events/",
            headers: {
                "Authorization": "Bearer " + jwt
            },
        })
    } else {
        values = await axios({
            method: 'GET',
            url: "http://localhost:3000/public/events/",
        })
    }

    if (searchinput != "") {
        let valuesarr = values.data.result;
        let searchprefix = new RegExp('^' + searchinput, 'i');
        let matches = valuesarr.filter((value) => searchprefix.test(value.toLowerCase()));
        return matches;
    } else {
        return "none";
    }


}

async function createEvent() {
    let container = $(this).parent();
    let body = $(this).parent().parent();
    let title = body.find('.title').find('.eventtitleinput').val();
    let image = container.find('.imagepreview').attr('id');
    let p = container.find('.radiocontainer').find('.radio').val()
    let datestart = container.find('.datestart').val();
    let dateend = container.find('dateend').val();
    let address = container.find('.addressinput').val();
    let description = container.find('.descriptioninput').val();
    let comments = [];

    let url = "http://localhost:3000/" + p;
    // let result = await axios ({
    //     method: 'GET',

    // })

}

function previewImage() {
    let image = document.querySelector('img');
    let filename = document.querySelector('input[type=file]').files[0];
    let reader = new FileReader();

    reader.addEventListener("load", function () {
        image.src = reader.result;
        image.id = reader.result;
    }, false);


    if (filename) {
        reader.readAsDataURL(filename);
    }

}


async function test() {
    let jwt = window.localStorage.getItem("jwt");
    let results = await axios({
        method: 'GET',
        url: "http://localhost:3000/private/events/",
        headers: {
            "Authorization": "Bearer " + jwt
        },
    })
    console.log(results);
}
async function test2() {
    let results = await axios({
        method: 'GET',
        url: "http://localhost:3000/public/events/",

    })
    console.log(results);
}

async function getEvent() {
    let name = $(this).text();

    let jwt = window.localStorage.getItem("jwt");
    let loggedin = window.localStorage.getItem("loggedin");
    if (loggedin == "true") {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/public/events/${name}`,

        })

        window.localStorage.setItem("title", name);
        window.localStorage.setItem("desc", results.data.result.description);
        window.location.replace("page.html");
    } else {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/public/events/${name}`,
        })
        window.localStorage.setItem("title", name);
        window.localStorage.setItem("desc", results.data.result.description);

        window.location.replace("page.html");

    }

}

function renderPage() {
    let name = window.localStorage.getItem("title")
    let desc = window.localStorage.getItem("desc")
    $("#eventtitle").html(`${name}`)
    $(".description").html(`${desc}`)
}


window.onload = function () {
    $(document).on("click", ".newuser", loadCreateAccount);
    $(document).on("click", ".createaccount", createAccount);
    $(document).on("click", ".backtologin", backtoLogin);
    $(document).on("click", ".loginsubmit", login);
    $(document).on("click", "#signintitle", checkLoggedIn);
    $(document).on("click", ".logout", logout);
    $(document).on("click", ".newevent", createEvent);
    $(document).on("input", ".searchevents", searchevents);
    $(document).on("change", ".backgroundimage", previewImage);
    $(document).on("click", "li", getEvent);
    renderPage()
    checkLoggedIn();
    let loggedin = window.localStorage.getItem("loggedin");
    if (loggedin == "true") {
        $(".login").replaceWith('<a class="account button" href="calendar.html">ACCOUNT</a>');
        $(".neweventdiv").replaceWith(`<div class="neweventdiv"><a class="newevent button" href="newevent.html">CREATE EVENT</a></div>`);
    } else {
        $(".account").replaceWith('<a class="login button" href="login.html">LOGIN</a>')
        $(".neweventdiv").replaceWith(`<div class="neweventdiv"></div>`);
    }
}