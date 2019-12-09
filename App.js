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

function renderIndex(loggedin) {
    if (loggedin) {
        $("#indexboy").replaceWith(`<a class="account button" href="login.html">ACCOUNT</a>
        <h1 id="maintitle">EVENTNITE</h1>
        <hr>
        <div class="searchcontainer">
            <input class="search" type="text" placeholder="Search Events">
            <button class="button" type="submit"><i class="fa fa-search"></i></button>
        </div>
        <div class="searchcontainer">
            <h4>Filter by Tags</h4>
            <input class="search" type="text" placeholder="Search Tags">
            <button class="button" type="submit"><i class="fa fa-search"></i></button>
        </div>
        <a class="newevent button" href="newevent.html">CREATE EVENT</a>
        <div class="container">
        </div>`);
    } else {
        $("#indexbody").replaceWith(`<a class="login button" href="login.html">LOGIN</a>
        <h1 id="maintitle">EVENTNITE</h1>
        <hr>
        <div class="searchcontainer">
            <input class="search" type="text" placeholder="Search Events">
            <button class="button" type="submit"><i class="fa fa-search"></i></button>
        </div>
        <div class="searchcontainer">
            <h4>Filter by Tags</h4>
            <input class="search" type="text" placeholder="Search Tags">
            <button class="button" type="submit"><i class="fa fa-search"></i></button>
        </div>
        <a class="newevent button" href="newevent.html">CREATE EVENT</a>
        <div class="container">
        </div>`)
    }
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

// export async function getStatus() {
//     try {
//         return (await axios.get(`\status`)).data;
//     } catch (error) {
//         return false
//     }
// }

window.onload = function () {
    $(document).on("click", ".newuser", loadCreateAccount);
    $(document).on("click", ".createaccount", createAccount);
    $(document).on("click", ".backtologin", backtoLogin);
    $(document).on("click", ".loginsubmit", login);
    $(document).on("click", "#signintitle", checkLoggedIn);
    $(document).on("click", ".logout", logout);
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