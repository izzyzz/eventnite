function loadCreateAccount() {
    let target = $(this).parent();
    target.replaceWith(`<div class="logincontainer">
    <div class="alert"></div>
    <p class="labels">USERNAME</p>
    <input type="text" placeholder="Create a Username" class="unameinput" required>
    <p class="labels">PASSWORD</p>
    <input type="password" placeholder="Choose a Password" class="password" required>
    <p class="labels">SECRET KEY</p>
    <input type="password" placeholder="Enter Secret Key" class="key" required>
    <button class="button createaccount" type="submit">CREATE ACCOUNT</button>
    <button class="button backtologin" type="submit">LOGIN</button>
    </div>`)

}

function backtoLogin() {
    let target = $(this).parent();
    target.replaceWith(`<div class="logincontainer">
    <div class="alert"></div>
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
    window.localStorage.removeItem("uname");
    window.localStorage.removeItem("pass");
}

async function createAccount() {
    let uname = $(this).parent().find(".unameinput").val();
    let pwd = $(this).parent().find(".password").val();
    let target = $(this).parent();
    let key = $(this).parent().find(".key").val();
    if (key == "secret") {
        try {
            let account = await axios({
                method: "POST",
                url: "http://localhost:3000/account/create",
                data: {
                    name: uname,
                    pass: pwd,
                    data: {
                        usercreated: 0
                    }
                }
            });

            target.replaceWith(`<div class="logincontainer">
            <div class="alert">Success!</div>
        <p class="labels">USERNAME</p>
        <input type="text" placeholder="Enter Username" class="unameinput" required>
        <p class="labels">PASSWORD</p>
        <input type="password" placeholder="Enter Password" class="password" required>
        <button class="button loginsubmit" type="submit">LOGIN</button>
        <button class="button newuser" type="submit">NEW USER</button>
        </div>`)
        } catch (e) {
            $(".alert").text("Something went wrong! Please try again.");
            $(".alert").css("display", "block");
        }
        return true;
    }
    else {
        $(".alert").text("Invalid Secret Key! Please try again.")
        $(".alert").css("display", "block");
    }
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
        window.localStorage.setItem("uname", uname);
        window.localStorage.setItem("pass", pwd);
        window.localStorage.setItem("loggedin", true);
        window.location.replace("index.html");
    } catch (e) {
        $(".alert").text("Incorrect Username or Password");
        $(".alert").css("display", "block");
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
    let rdatestart = container.find('.datestart').val();
    let rdateend = container.find('.dateend').val();
    let raddress = container.find('.addressinput').val();
    let rdescription = container.find('.descriptioninput').val();
    let rp;
    if ($('.public').is(':checked')) {
        rp = "public"
    } else {
        rp = "private"
    }

    if (rtitle == "" || rimage == "" || rp == "" || rdatestart == "" || rdateend == "" || raddress == "" || rdescription == "") {
        $(".alert").text("Oh no! You seem to have left something blank, please try again.");
        $(".alert").css("display", "block");
    } else {

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
                        created: true,
                        datestart: rdatestart,
                        dateend: rdateend,
                        notes: ""
                    }
                }
            })
            let status = await axios({
                method: 'GET',
                url: "http://localhost:3000/account/status",
                headers: {
                    "Authorization": "Bearer " + window.localStorage.getItem('jwt')
                },
            })
            let created = status.data.user.data.usercreated;
            let update = await axios({
                method: 'POST',
                url: `http://localhost:3000/account/users`,
                data: {
                    name: window.localStorage.getItem("uname"),
                    pass: window.localStorage.getItem("pass"),
                    data: {

                        usercreated: parseInt(created, 10) + 1
                    }
                },
                headers: {
                    "Authorization": "Bearer " + window.localStorage.getItem('jwt')
                },
            })
        }
        window.localStorage.setItem("title", rtitle);
        window.location.replace("page.html");
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
        let status = await axios({
            method: 'GET',
            url: "http://localhost:3000/account/status",
            headers: {
                "Authorization": "Bearer " + jwt
            },
        })
        let created = status.data.user.data.usercreated;
        console.log(status.data.user);
        if (created != "0") {
            //if you have your user events, get your events
            let usercheck = await axios({
                method: 'GET',
                url: `http://localhost:3000/user/events`,
                headers: {
                    "Authorization": "Bearer " + jwt
                },
            });
            let keys = Object.keys(usercheck.data.result);
            //for each event, if its already your event, don't display add to my event
            //for each event, if it is already your event, and you created it, allow update.
            keys.forEach((event) => {
                if (usercheck.data.result[event].title == name) {
                    target.find(".add").css("display", "none");
                    if (usercheck.data.result[event].created) {
                        target.find(".image-container").find(".after").find(".edit").css("display", "block");
                    }
                }

            });
        }


    } else {
        let results = await axios({
            method: 'GET',
            url: `http://localhost:3000/public/events/${name}`,
        });
        result = results.data.result;
        target.find(".add").css("display", "none");
    }
    let datestr;
    let datestart = result.datestart.split("-");
    let dateend = result.dateend.split("-");
    if (result.datestart == result.dateend) {
        datestr = months[parseInt(datestart[1], 10)] + " " + datestart[2] + ", " + datestart[0]
    } else {
        datestr = months[parseInt(datestart[1], 10)] + " " + datestart[2] + ", " + datestart[0] + " - " +
            months[parseInt(dateend[1], 10)] + " " + dateend[2] + ", " + dateend[0];
    }
    target.find(".image-container").find("img").attr('src', result.image);
    target.find(".image-container").find(".after").find("#eventtitle").text(result.title);
    target.find(".image-container").find(".after").find(".datetitle").text(datestr);
    target.find(".descriptioncontainer").find(".textdescription").text(result.description);
    target.find(".descriptioncontainer").find(".textaddress").text(result.address);

    L.mapquest.key = 'OPrIvojYLYrQph7GkvJM1Ai0iPAt2AQw';
    var map = L.mapquest.map('map', {
        center: [0, 0],
        layers: L.mapquest.tileLayer('map'),
        zoom: 14
    });

    L.mapquest.geocoding().geocode(result.address);

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
            let datestr;
            if (results2.data.result[result].datestart == results2.data.result[result].dateend) {
                datestr = months[parseInt(datestart[1], 10)] + " " + datestart[2] + ", " + datestart[0]
            } else {
                datestr = months[parseInt(datestart[1], 10)] + " " + datestart[2] + ", " + datestart[0] + " - " +
                    months[parseInt(dateend[1], 10)] + " " + dateend[2] + ", " + dateend[0];
            }
            $(".container").append(`<div class="event">
            <div class=image style="background-image: url('${results2.data.result[result].image}')";></div>
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
            <div class=image style="background-image: url('${results2.data.result[result].image}')";></div>
            <h2 class="title">${results2.data.result[result].title}</h2>
            <hr></hr>
            <p class="date">${datestr}</p>
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

        window.location.replace("updateevent.html");
    }

}

async function update() {
    let jwt = window.localStorage.getItem("jwt");
    let name = window.localStorage.getItem("title")
    let datestart = $(".datestart").val()
    let dateend = $(".dateend").val()
    let img = $(".backgroundimage").val()
    let address = $(".addressinput").val()
    let p;
    if ($('.public').is(':checked')) {
        p = "public"
    } else {
        p = "private"
    }
    let desc = $(".descriptioninput").val();
    //updating public event => both stores
    //updating private event => private store
    //changing public to private => remove from public store
    //changing private to public => add to public store
    if (p == "public" && window.localStorage.getItem("p") == "public") {
        let result = await axios({
            method: 'post',
            url: `http://localhost:3000/private/events/${name}`,
            data: {
                data: {
                    "title": `${name}`,
                    "datestart": `${datestart}`,
                    "dateend": `${dateend}`,
                    "image": `${img}`,
                    "address": `${address}`,
                    "description": `${desc}`,
                    "p": `${p}`,
                }
            },
            headers: {
                "Authorization": "Bearer " + jwt
            },
        });
        let result2 = await axios({
            method: 'post',
            url: `http://localhost:3000/public/events/${name}`,
            data: {
                data: {
                    "title": `${name}`,
                    "datestart": `${datestart}`,
                    "dateend": `${dateend}`,
                    "image": `${img}`,
                    "address": `${address}`,
                    "description": `${desc}`,
                    "p": `${p}`,
                }
            },
        });
    }
    else if (p == "private" && window.localStorage.getItem("p") == "private") {
        let result = await axios({
            method: 'post',
            url: `http://localhost:3000/private/events/${name}`,
            data: {
                data: {
                    "title": `${name}`,
                    "datestart": `${datestart}`,
                    "dateend": `${dateend}`,
                    "image": `${img}`,
                    "address": `${address}`,
                    "description": `${desc}`,
                    "p": `${p}`,

                }
            },
            headers: {
                "Authorization": "Bearer " + jwt
            },
        });
    } else if (p == "private" && window.localStorage.getItem("p") == "public") {
        let result = await axios({
            method: 'post',
            url: `http://localhost:3000/private/events/${name}`,
            data: {
                data: {
                    "title": `${name}`,
                    "datestart": `${datestart}`,
                    "dateend": `${dateend}`,
                    "image": `${img}`,
                    "address": `${address}`,
                    "description": `${desc}`,
                    "p": `${p}`,
                }
            },
            headers: {
                "Authorization": "Bearer " + jwt
            },
        });
        let result2 = await axios({
            method: 'delete',
            url: `http://localhost:3000/public/events/${name}`,
        });

    } else if (p == "public" && window.localStorage.getItem("p") == "private") {
        let result = await axios({
            method: 'post',
            url: `http://localhost:3000/private/events/${name}`,
            data: {
                data: {
                    "title": `${name}`,
                    "datestart": `${datestart}`,
                    "dateend": `${dateend}`,
                    "image": `${img}`,
                    "address": `${address}`,
                    "description": `${desc}`,
                    "p": `${p}`,
                }
            },
            headers: {
                "Authorization": "Bearer " + jwt
            },
        });
        let result2 = await axios({
            method: 'post',
            url: `http://localhost:3000/public/events/${name}`,
            data: {
                data: {
                    "title": `${name}`,
                    "datestart": `${datestart}`,
                    "dateend": `${dateend}`,
                    "image": `${img}`,
                    "address": `${address}`,
                    "description": `${desc}`,
                    "p": `${p}`,
                }
            },
        });
    }

    window.location.replace("page.html");
}

async function addMyEvent() {
    let rtitle = $(this).parent().find(".image-container").find(".after").find("#eventtitle").text();
    let date = $(this).parent().find(".image-container").find(".after").find(".datetitle").text();
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
    let start;
    let end;
    if (date.includes("-")) {
        let s = date.split(" - ")[0].split(" ");
        let e = date.split(" - ")[1].split(" ");
        start = s[2] + "-" + months[s[0]] + "-" + s[1].slice(0, s.length - 1);
        end = e[2] + "-" + months[e[0]] + "-" + e[1].slice(0, s.length - 1);
    } else {
        let s = date.split(" ");
        start = s[2] + "-" + months[s[0]] + "-" + s[1].slice(0, s.length - 1);
        end = start;
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
                    created: false,
                    datestart: start,
                    dateend: end,
                    notes: ""
                }
            }
        })
    }
    let status = await axios({
        method: 'GET',
        url: "http://localhost:3000/account/status",
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem('jwt')
        },
    })
    let created = status.data.user.data.usercreated;
    let update = await axios({
        method: 'POST',
        url: `http://localhost:3000/account/users`,
        data: {
            name: window.localStorage.getItem("uname"),
            pass: window.localStorage.getItem("pass"),
            data: {
                usercreated: parseInt(created, 10) + 1
            }
        },
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem('jwt')
        },
    })

}

async function renderMyEvents() {
    let status = await axios({
        method: 'GET',
        url: "http://localhost:3000/account/status",
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem('jwt')
        },
    })
    let created = status.data.user.data.usercreated;
    if (created != 0) {
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
            let datestr;
            if (myevents.data.result[event].datestart == myevents.data.result[event].dateend) {
                let datestart = myevents.data.result[event].datestart.split("-");
                datestr = months[parseInt(datestart[1], 10)] + " " + datestart[2] + ", " + datestart[0];
            } else {
                let datestart = myevents.data.result[event].datestart.split("-");
                let dateend = myevents.data.result[event].dateend.split("-");
                datestr = months[parseInt(datestart[1], 10)] + " " + datestart[2] + ", " + datestart[0] + " - " +
                    months[parseInt(dateend[1], 10)] + " " + dateend[2] + ", " + dateend[0];
            }

            if (myevents.data.result[event].created == true) {
                appendstr = appendstr + `<div class="event-card">
                <div class="event-head"><b>${myevents.data.result[event].title}</b>:  ${datestr}</div>
                <div class="event-notes"><p>${myevents.data.result[event].notes}</p><br><button class="editnotes button">EDIT NOTES</<button></div>
                </div>`
            } else {
                appendstr = appendstr + `<div class="event-card">
            <div class="event-head"><b>${myevents.data.result[event].title}</b>:  ${datestr}</div>
            <div class="event-notes"><p>${myevents.data.result[event].notes}</p><br><button class="removenotes button">REMOVE</button><button class="editnotes button">EDIT NOTES</<button></div>
            </div>`
            }
        })

        $(".event-container").replaceWith(`<div class="event-container">${appendstr}</div>`);
    }
}

async function renderEdit() {
    let name = window.localStorage.getItem("title")
    let jwt = window.localStorage.getItem("jwt");

    let results = await axios({
        method: 'GET',
        url: `http://localhost:3000/private/events/${name}`,
        headers: {
            "Authorization": "Bearer " + jwt
        },
    })
    $(".title").replaceWith(`<h1 class="title">${name}</h1>`)
    $(".backgroundimage").replaceWith(`<input type="text" class="backgroundimage" value=${results.data.result.image}>`)
    $(".dateinput").replaceWith(`<div class="dateinput"><input type="date" class="datestart" value="${results.data.result.datestart}"> to <input type="date" class="dateend" value="${results.data.result.dateend}"></div>`)
    $(".addressinput").replaceWith(`<input type="text" class="addressinput" placeholder="Where is your event? (Please input a valid address)" value="${results.data.result.address}">`)
    $(".descriptioninput").replaceWith(`<textarea class="descriptioninput" placeholder="What time is your event? What would you like people to know about your event?" value="${results.data.result.description}"></textarea>`)
    if (results.data.result.p == "private") {
        $(".radiocontainer").replaceWith(`<div class="radiocontainer">
        <input type="radio" class="radio" name="type" value="public">Public
        <input type="radio" class="radio" name="type" value="private" checked>Private
    </div>`)
    }
    window.localStorage.setItem("p", results.data.result.p);
    console.log(window.localStorage.getItem("p"));
}

function renderEditNotes() {
    let target = $(this).parent();
    let text = $(this).parent().find("p").text();
    target.replaceWith(`<div class="event-notes"><textarea class=${text}>${text}</textarea><br><button class="submitedit button">SAVE</button><button class="canceledit button">CANCEL</<button></div>`)
}

async function renderCancelEdit() {
    let target = $(this).parent();
    let name = $(this).parent().parent().find("b").text();
    let text = $(this).parent().find("textarea").attr("class");
    let status = await axios({
        method: 'GET',
        url: "http://localhost:3000/account/status",
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem('jwt')
        },
    })
    let created = status.data.user.data.usercreated;
    if (created != 0) {

        let myevents = await axios({
            method: 'GET',
            url: `http://localhost:3000/user/events`,
            headers: {
                "Authorization": "Bearer " + window.localStorage.getItem("jwt")
            }
        });
        let keys = Object.keys(myevents.data.result)
        keys.forEach((event) => {
            if (myevents.data.result[event].title == name) {

                if (myevents.data.result[event].created == true) {
                    target.replaceWith(`<div class="event-notes"><p>${myevents.data.result[event].notes}</p><br><button class="editnotes button">EDIT NOTES</<button></div>`)
                } else {
                    target.replaceWith(`<div class="event-notes"><p>${myevents.data.result[event].notes}</p><br><button class="removenotes button">REMOVE</button><button class="editnotes button">EDIT NOTES</<button></div>`)
                }
            }
        })
    }
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

    let status = await axios({
        method: 'GET',
        url: "http://localhost:3000/account/status",
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem('jwt')
        },
    })
    let created = status.data.user.data.usercreated;
    if (created != 0) {
        let myevents = await axios({
            method: 'GET',
            url: `http://localhost:3000/user/events`,
            headers: {
                "Authorization": "Bearer " + window.localStorage.getItem("jwt")
            }
        });
        let keys = Object.keys(myevents.data.result)
        keys.forEach((event) => {
            if (myevents.data.result[event].title == name) {

                if (myevents.data.result[event].created == true) {
                    target.replaceWith(`<div class="event-notes"><p>${text}</p><br><button class="editnotes button">EDIT NOTES</<button></div>`);
                } else {
                    target.replaceWith(`<div class="event-notes"><p>${text}</p><br><button class="removenotes button">REMOVE</button><button class="editnotes button">EDIT NOTES</<button></div>`);
                }
            }
        })
    }


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

    let status = await axios({
        method: 'GET',
        url: "http://localhost:3000/account/status",
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem('jwt')
        },
    })
    let created = status.data.user.data.usercreated;
    let update = await axios({
        method: 'POST',
        url: `http://localhost:3000/account/users`,
        data: {
            name: window.localStorage.getItem("uname"),
            pass: window.localStorage.getItem("pass"),
            data: {

                usercreated: parseInt(created, 10) - 1
            }
        },
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem('jwt')
        },
    })
}

async function deleteEvent() {
    let name = window.localStorage.getItem("title")
    let jwt = window.localStorage.getItem("jwt");
    // let result = await axios({
    //     method: 'DELETE',
    //     url: 'http://localhost:3000/user/events/' + name,
    //     headers: {
    //         "Authorization": "Bearer " + jwt
    //     },
    // });

    let usercheck = await axios({
        method: 'GET',
        url: `http://localhost:3000/user/events`,
        headers: {
            "Authorization": "Bearer " + jwt
        },
    });
    if (window.localStorage.getItem("p") == "public") {
        let result2 = await axios({
            method: 'DELETE',
            url: 'http://localhost:3000/public/events/' + name,
        });
    }
    let result3 = await axios({
        method: 'DELETE',
        url: 'http://localhost:3000/private/events/' + name,
        headers: {
            "Authorization": "Bearer " + jwt
        },
    });
    let status = await axios({
        method: 'GET',
        url: "http://localhost:3000/account/status",
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem('jwt')
        },
    })
    let created = status.data.user.data.usercreated;
    let update = await axios({
        method: 'POST',
        url: `http://localhost:3000/account/users`,
        data: {
            name: window.localStorage.getItem("uname"),
            pass: window.localStorage.getItem("pass"),
            data: {

                usercreated: parseInt(created, 10) - 1
            }
        },
        headers: {
            "Authorization": "Bearer " + window.localStorage.getItem('jwt')
        },
    })
    window.location.replace("index.html");
}

function handleCancel() {
    window.location.replace("page.html");
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
    $(document).on("click", ".updateevent", update);
    $(document).on("click", ".deleteevent", deleteEvent);
    $(document).on("click", ".cancelupdate", handleCancel);
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
        $(".neweventdiv").replaceWith(`<div class="neweventdiv"><a class="neweventhome button" href="newevent.html">CREATE EVENT</a></div>`);
    } else {
        $(".account").replaceWith('<a class="login button" href="login.html">LOGIN</a>')
        $(".neweventdiv").replaceWith(`<div class="neweventdiv"></div>`);
    }
}

