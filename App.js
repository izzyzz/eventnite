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
    if (window.localStorage.getItem("loggedin") == "true") {
        let d = await axios({
            method: 'POST',
            url: `http://localhost:3000/user/events/${rtitle}`,
            headers: {
                "Authorization": "Bearer " + window.localStorage.getItem("jwt")
            },
            data: {
                data: {
                    title: rtitle,
                    datestart: rdatestart,
                    dateend: rdateend,
                    notes: ""
                }
            }
        })
        let created = window.localStorage.getItem("usercreated")
        console.log(created);
        if (created == null) {
            window.localStorage.setItem("usercreated", 1);
        } else {
            window.localStorage.setItem("usercreated", parseInt(created, 10) + 1);
        }
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

function getEventPageBySearch() {
    let name = $(this).text();
    window.localStorage.setItem("title", name);
    window.location.replace("page.html");
}

function getEventPage() {
    let name = $(this).find("h2").text();
    window.localStorage.setItem("title", name);
    window.location.replace("page.html");
}

function getEventPageByMine() {
    let name = $(this).find("b").text();
    console.log(name);
    window.localStorage.setItem("title", name);
    window.location.replace("page.html");
}

async function renderPage() {
    let name = window.localStorage.getItem("title");
    let jwt = window.localStorage.getItem("jwt");
    let loggedin = window.localStorage.getItem("loggedin");
    let target = $(".page-body");
    let result = []
    let months = ["", "Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (loggedin == "true") {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/private/events/${name}`,
            headers: {
                "Authorization": "Bearer " + jwt
            },
        });
        result = results.data.result;
        target.find(".add").css("display", "block");
        if (window.localStorage.getItem("usercreated") != null || window.localStorage.getItem("usercreated") != 0) {
            let usercheck = await axios({
                method: 'GET',
                url: `http://localhost:3000/user/events/`,
                headers: {
                    "Authorization": "Bearer " + jwt
                },
            });

            let usercheckarr = usercheck.data.result;
            for (let i = 0; i < usercheckarr.length; i++) {
                if (usercheckarr[i] == name) {
                    target.find(".add").css("display", "none");
                }
            }
        }

        // window.localStorage.setItem("title", name);
        // window.localStorage.setItem("desc", results.data.result.description);
        // window.localStorage.setItem("startdate", results.data.result.datestart);
        // window.localStorage.setItem("enddate", results.data.result.dateend);
        // window.localStorage.setItem("pic", results.data.image);
        // window.localStorage.setItem("addy", results.data.address);

        // window.location.replace("page.html");
    } else {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/public/events/${name}`,
        });
        result = results.data.result;
        target.find(".add").css("display", "none");
    }

    let datestart = result.datestart.split("-");
    let dateend = result.dateend.split("-");
    let datestr = months[parseInt(datestart[1], 10)] + " " + datestart[2] + ", " + datestart[0] + " - " +
        months[parseInt(dateend[1], 10)] + " " + dateend[2] + ", " + dateend[0];
    target.find(".image-container").find("img").attr('src', result.image);
    target.find(".image-container").find(".after").find("#eventtitle").text(result.title);
    target.find(".image-container").find(".after").find(".datetitle").text(datestr);
    target.find(".descriptioncontainer").find(".textdescription").text(result.description);
    target.find(".descriptioncontainer").find(".textaddress").text(result.address);
    let commentstr = ""
    for (let i = 0; i < result.comments.length; i++) {
        commentstr = commentstr + `<div class="comment">${result.comments[i]}</div>`;
    }
    target.find(".comments").find(".comments-container").replaceWith(`<div class="comments-container">${commentstr}</div>`);
}

async function renderEvents() {
    let jwt = window.localStorage.getItem("jwt");
    let loggedin = window.localStorage.getItem("loggedin");
    let months = ["", "Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
            let datestart = results2.data.result[result].datestart.split("-");
            let dateend = results2.data.result[result].dateend.split("-");
            let datestr = months[parseInt(datestart[1], 10)] + " " + datestart[2] + ", " + datestart[0] + " - " +
                months[parseInt(dateend[1], 10)] + " " + dateend[2] + ", " + dateend[0];
            $(".container").append(`<div class="event">
            <div class=image style="background-image: url(${results2.data.result[result].image})";></div>
            <h2 class="title">${result}</h2>
            <hr></hr>
            <p class="date">${datestr}</p>
        </div>`)
        })

    } else {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/public/events/`,
        })
        let results2 = await axios({
            method: 'GET',
            url: `http://localhost:3000/public/events`,
        })
        results.data.result.forEach((result) => {
            let datestart = results2.data.result[result].datestart.split("-");
            let dateend = results2.data.result[result].dateend.split("-");
            let datestr = months[parseInt(datestart[1], 10)] + " " + datestart[2] + ", " + datestart[0] + " - " +
                months[parseInt(dateend[1], 10)] + " " + dateend[2] + ", " + dateend[0];
            $(".container").append(`<div class="event">
            <div class=image style="background-image: url(${results2.data.result[result].image})";></div>
            <h2 class="title">${datestr}</h2>
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

async function update() {
    let jwt = window.localStorage.getItem("jwt");
    let result = await axios({
        method: 'post',
        url: 'http://localhost:3000/private/events/TEST',
        data: {
            data: {
                "title": "TEST",
                "datestart": "1212-12-12",
                "dateend": "1222-12-12",
                "image": "12",
                "address": "12",
                "description": "15",
                "p": "public",
                "comments": []
            }
        },
        headers: {
            "Authorization": "Bearer " + jwt
        },
    });
}

async function addMyEvent() {
    let rtitle = $(this).parent().find(".image-container").find(".after").find("#eventtitle").text();
    let date = $(this).parent().find(".image-container").find(".after").find(".datetitle").text();
    let s = date.split(" - ")[0].split(" ");
    let e = date.split(" - ")[1].split(" ");
    let months = {
        "Jan": 1,
        "Feb": 2,
        "Mar": 3,
        "Apr": 4,
        "May": 5,
        "June": 6,
        "Jul": 7,
        "Aug": 8,
        "Sep": 9,
        "Oct": 10,
        "Nov": 11,
        "Dec": 12
    }
    let start = s[2] + "-" + months[s[0]] + "-" + s[1].slice(0, s.length - 1);
    let end = e[2] + "-" + months[e[0]] + "-" + e[1].slice(0, s.length - 1);

    if (window.localStorage.getItem("loggedin") == "true") {
        let d = await axios({
            method: 'POST',
            url: `http://localhost:3000/user/events/${rtitle}`,
            headers: {
                "Authorization": "Bearer " + window.localStorage.getItem("jwt")
            },
            data: {
                data: {
                    title: rtitle,
                    datestart: start,
                    dateend: end,
                    notes: ""
                }
            }
        })
    }
}

async function renderMyEvents() {
    if (window.localStorage.getItem("usercreated") != 0 || window.localStorage.getItem("usercreated") != null) {
        let myevents = await axios({
            method: 'GET',
            url: `http://localhost:3000/user/events`,
            headers: {
                "Authorization": "Bearer " + window.localStorage.getItem("jwt")
            }
        });
        let appendstr = "";
        let months = ["", "Jan", "Feb", "Mar", "Apr", "May", "June", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let keys = Object.keys(myevents.data.result)
        keys.forEach((event) => {
            let datestart = myevents.data.result[event].datestart.split("-");
            let dateend = myevents.data.result[event].dateend.split("-");
            let datestr = months[parseInt(datestart[1], 10)] + " " + datestart[2] + ", " + datestart[0] + " - " +
                months[parseInt(dateend[1], 10)] + " " + dateend[2] + ", " + dateend[0];
            appendstr = appendstr + `<div class="event-card">
            <div class="event-head"><b>${myevents.data.result[event].title}</b>:  ${datestr}</div>
            <div class="event-notes"><p>${myevents.data.result[event].notes}</p><br><button class="removenotes button">REMOVE</button><button class="editnotes button">EDIT NOTES</<button></div>
            </div>`
        })

        $(".event-container").replaceWith(`<div class="event-container">${appendstr}</div>`);
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
    $(".dateinput").replaceWith(`<div class="dateinput"><input type="date" class="datestart" value="${start}"> to <input type="date" class="dateend" value="${end}"></div>`)
    $(".addressinput").replaceWith(`<input type="text" class="addressinput" placeholder="Where is your event? (Please input a valid address)" value="${addy}">`)
    $(".descriptioninput").replaceWith(`<input type="text" class="descriptioninput" placeholder="What would you like people to know about your event?" value="${desc}">`)
    if (p == "private") {
        $(".radiocontainer").replaceWith(`<div class="radiocontainer">
        <input type="radio" class="radio" name="type" value="public">Public
        <input type="radio" class="radio" name="type" value="private" checked>Private
    </div>`)
    }
}

function renderEditNotes() {
    let target = $(this).parent();
    let text = $(this).parent().find("p").text();
    target.replaceWith(`<div class="event-notes"><textarea class=${text}>${text}</textarea><br><button class="submitedit button">EDIT</button><button class="canceledit button">CANCEL</<button></div>`)
}

function renderCancelEdit() {
    let target = $(this).parent();
    let text = $(this).parent().find("textarea").attr("class");
    target.replaceWith(`<div class="event-notes"><p>${text}</p><br><button class="removenotes button">REMOVE</button><button class="editnotes button">EDIT NOTES</<button></div>`)
}

async function editNotes() {
    let target = $(this).parent();
    let name = $(this).parent().parent().find("b").text();
    let text = $(this).parent().find("textarea").val();
    let jwt = window.localStorage.getItem("jwt");
    let result = await axios({
        method: 'POST',
        url: 'http://localhost:3000/user/events/' + name + '/notes',
        data: {
            data: text
        },
        headers: {
            "Authorization": "Bearer " + jwt
        },
    });
    target.replaceWith(`<div class="event-notes"><p>${text}</p><br><button class="removenotes button">REMOVE</button><button class="editnotes button">EDIT NOTES</<button></div>`);

}

async function deleteMine() {
    let target = $(this).parent().parent();
    let name = $(this).parent().parent().find("b").text();
    let jwt = window.localStorage.getItem("jwt");
    let result = await axios({
        method: 'DELETE',
        url: 'http://localhost:3000/user/events/' + name,
        headers: {
            "Authorization": "Bearer " + jwt
        },
    });
    target.remove(this);
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
    $(document).on("click", "li", getEventPageBySearch);
    $(document).on("click", ".event", getEventPage);
    $(document).on("click", ".event-head", getEventPageByMine);
    $(document).on("click", ".edit", getEditPage);
    $(document).on("click", ".add", addMyEvent);
    $(document).on("click", ".editnotes", renderEditNotes);
    $(document).on("click", ".canceledit", renderCancelEdit);
    $(document).on("click", ".submitedit", editNotes);
    $(document).on("click", ".removenotes", deleteMine);
    if (top.location.pathname === '/page.html') {
        renderPage()
    }
    if (top.location.pathname === '/myevents.html') {
        renderMyEvents()
    }
    if (top.location.pathname == "/" || top.location.pathname == "/index.html") {
        renderEvents()
    }
    if (top.location.pathname === '/updateevent.html') {
        renderEdit()
    }
    checkLoggedIn();
    let loggedin = window.localStorage.getItem("loggedin");
    if (loggedin == "true") {
        $(".login").replaceWith('<a class="account button" href="myevents.html">ACCOUNT</a>');
        $(".neweventdiv").replaceWith(`<div class="neweventdiv"><a class="newevent button" href="newevent.html">CREATE EVENT</a></div>`);
    } else {
        $(".account").replaceWith('<a class="login button" href="login.html">LOGIN</a>')
        $(".neweventdiv").replaceWith(`<div class="neweventdiv"></div>`);
    }
}

