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
    let rtitle = body.find('.title').find('.eventtitleinput').val();
    let rimage = container.find('.backgroundimage').val();
    let rp = container.find('.radiocontainer').find("input[class='radio']:checked").val();
    let rdatestart = container.find('.datestart').val();
    let rdateend = container.find('.dateend').val();
    let raddress = container.find('.addressinput').val();
    let rdescription = container.find('.descriptioninput').val();

    //if event is private it is only in private store
    if (rp == "private" && window.localStorage.getItem("loggedin") == "true") {
        console.log("hi");
        let a = await axios({
            method: 'POST',
            url: `http://localhost:3000/private/events/${rtitle}`,
            headers: {
                "Authorization": "Bearer " + window.localStorage.getItem("jwt")
            },
            data: {
                data: {
                    title: rtitle,
                    datestart: rdatestart,
                    dateend: rdateend,
                    image: rimage,
                    address: raddress,
                    description: rdescription,
                    p: rp,
                    comments: [],
                }
            }
        })
    } else {
        //if event is public it is in both data stores
        let b = await axios({
            method: 'POST',
            url: `http://localhost:3000/public/events/${rtitle}`,
            data: {
                data: {
                    title: rtitle,
                    datestart: rdatestart,
                    dateend: rdateend,
                    image: rimage,
                    address: raddress,
                    description: rdescription,
                    p: rp,
                    comments: [],
                }
            }
        });
        let c = await axios({
            method: 'POST',
            url: `http://localhost:3000/private/events/${rtitle}`,
            headers: {
                "Authorization": "Bearer " + window.localStorage.getItem("jwt")
            },
            data: {
                data: {
                    title: rtitle,
                    datestart: rdatestart,
                    dateend: rdateend,
                    image: rimage,
                    address: raddress,
                    description: rdescription,
                    p: rp,
                    comments: [],
                }
            }
        })
    }



}

// function previewImage() {
//     let image = document.querySelector('img');
//     let filename = document.querySelector('input[type=file]').files[0];
//     let reader = new FileReader();

//     reader.addEventListener("load", function () {
//         image.src = reader.result;
//         image.id = reader.result;
//     }, false);


//     if (filename) {
//         reader.readAsDataURL(filename);
//     }

// }


async function getEvent() {
    let name = $(this).text();

    let jwt = window.localStorage.getItem("jwt");
    let loggedin = window.localStorage.getItem("loggedin");
    if (loggedin == "true") {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/private/events/${name}`,
            headers: {
                "Authorization": "Bearer " + jwt
            },
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

async function getEventPage() {
    let name = $(this).find("h2").text();
    let jwt = window.localStorage.getItem("jwt");
    let loggedin = window.localStorage.getItem("loggedin");
    if (loggedin == "true") {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/private/events/${name}`,
            headers: {
                "Authorization": "Bearer " + jwt
            },
        })

        window.localStorage.setItem("title", name);
        window.localStorage.setItem("desc", results.data.result.description);
        window.localStorage.setItem("startdate", results.data.result.datestart);
        window.localStorage.setItem("enddate", results.data.result.dateend);
        window.localStorage.setItem("pic", results.data.result.image);
        window.localStorage.setItem("addy", results.data.result.address);

        window.location.replace("page.html");
    } else {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/public/events/${name}`,
        })
        window.localStorage.setItem("title", name);
        window.localStorage.setItem("desc", results.data.result.description);
        window.localStorage.setItem("startdate", results.data.result.datestart);
        window.localStorage.setItem("enddate", results.data.result.dateend);
        window.localStorage.setItem("pic", results.data.result.image);
        window.localStorage.setItem("addy", results.data.result.address);
        window.location.replace("page.html");

    }

}

function renderPage() {
    let name = window.localStorage.getItem("title")
    let addy = window.localStorage.getItem("addy")
    let desc = window.localStorage.getItem("desc")
    let start = window.localStorage.getItem("startdate")
    let end = window.localStorage.getItem("enddate")
    let pic = window.localStorage.getItem("pic")

    $("#eventtitle").html(`${name}`)
    $(".description").html(`${desc}`)
    $(".address").html(`${addy}`)
    $('#header').attr("src", `${pic}`);
    let startF = moment(start).format('MMMM D, Y')
    let endF = moment(end).format('MMMM D, Y')
    $(".startdate").html(`${startF}`)
    if (startF != endF) { $(".enddate").html(` - ${endF}`) }

}

async function renderEvents() {
    let jwt = window.localStorage.getItem("jwt");
    let loggedin = window.localStorage.getItem("loggedin");
    if (loggedin == "true") {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/private/events/`,
            headers: {
                "Authorization": "Bearer " + jwt
            },
        })
        let results2 = await axios({
            method: 'GET',
            url: `http://localhost:3000/private/events`,
            headers: {
                "Authorization": "Bearer " + jwt
            },
        })
        results.data.result.forEach((result) => {
            $(".container").append(`<div class="event">
            <div class=image style="background-image: url(${results2.data.result[result].image})";></div>
            <h2 class="title">${result}</h2>
            <hr></hr>
            <p class="date">Jan 21st 8am - Jan 21st 9am</p>
        </div>`)
        })

    } else {
        results = await axios({
            method: 'GET',
            url: `http://localhost:3000/public/events/`,
        })
        let results2 = await axios({
            method: 'GET',
            url: `http://localhost:3000/private/events`,
            headers: {
                "Authorization": "Bearer " + jwt
            },
        })
        results.data.result.forEach((result) => {
            $(".container").append(`<div class="event">
            <div class=image style="background-image: url(${results2.data.result[result].image})";></div>
            <h2 class="title">${result}</h2>
            <hr></hr>
            <p class="date">Jan 21st 8am - Jan 21st 9am</p>
        </div>`)
        })
    }
}

async function getEditPage() {
    let name = $(this).parent().find("h1").text();
    console.log(name);
    let jwt = window.localStorage.getItem("jwt");
    let loggedin = window.localStorage.getItem("loggedin");
    if (loggedin == "true") {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/private/events/${name}`,
            headers: {
                "Authorization": "Bearer " + jwt
            },
        })

        window.localStorage.setItem("title", name);
        window.localStorage.setItem("desc", results.data.result.description);
        window.localStorage.setItem("startdate", results.data.result.datestart);
        window.localStorage.setItem("p", results.data.result.p);
        window.localStorage.setItem("enddate", results.data.result.dateend);
        window.localStorage.setItem("pic", results.data.result.image);
        window.localStorage.setItem("addy", results.data.result.address);

        window.location.replace("updateevent.html");
    } else {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/public/events/${name}`,
        })
        window.localStorage.setItem("title", name);
        window.localStorage.setItem("desc", results.data.result.description);
        window.localStorage.setItem("startdate", results.data.result.datestart);
        window.localStorage.setItem("enddate", results.data.result.dateend);
        window.localStorage.setItem("p", results.data.result.p);
        window.localStorage.setItem("pic", results.data.result.image);
        window.localStorage.setItem("addy", results.data.result.address);
        window.location.replace("updateevent.html");

    }

}

function renderEdit() {
    let name = window.localStorage.getItem("title")
    let addy = window.localStorage.getItem("addy")
    let desc = window.localStorage.getItem("desc")
    let start = window.localStorage.getItem("startdate")
    let end = window.localStorage.getItem("enddate")
    let pic = window.localStorage.getItem("pic")
    let p = window.localStorage.getItem("p")
    console.log(name)
    $(".eventtitleinput").replaceWith(`<input type="text" class="eventtitleinput" value="${name}">`)
    $(".backgroundimage").replaceWith(`<input type="text" class="backgroundimage" value=${pic}>`)
    $(".dateinput").replaceWith(`<div class="dateinput"><input type="date" class="datestart" value="${start}"> to <input type="date" class="dateend" value="${end}">
    </div>`)
    $(".addressinput").replaceWith(`<input type="text" class="addressinput" placeholder="Where is your event? (Please input a valid address)" value="${addy}">`)
    $(".descriptioninput").replaceWith(`<input type="text" class="descriptioninput" placeholder="What would you like people to know about your event?" value="${desc}">`)
    if (p == "private") {
        $(".radiocontainer").replaceWith(`<div class="radiocontainer">
            <input type="radio" class="radio" name="type" value="public">Public
            <input type="radio" class="radio" name="type" value="private" checked>Private
        </div>`)
    }
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
    $(document).on("click", "li", getEvent);
    $(document).on("click", ".event", getEventPage);
    $(document).on("click", ".edit", getEditPage)
    if (top.location.pathname === '/page.html') {
        renderPage()
    }
    renderEvents()
    renderEdit()
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