function loadCreateAccount() {
    let target = $(this).parent();
    target.replaceWith(`<div class="logincontainer">
    <p class="labels">USERNAME</p>
    <input type="text" placeholder="Create a Username" class="unameinput" required>
    <p class="labels">PASSWORD</p>
    <input type="password" placeholder="Choose a Password" class="password" required>

    <button class="button createaccount" type="submit">CREATE ACCOUNT</button>
    </div>`)

}

async function createAccount() {
    let uname = $(this).parent().find(".unameinput").val();
    let pwd = $(this).parent().find(".password").val();
    let target = $(this).parent();

    await axios({
        method: "POST",
        url: "http://localhost:3000/account/create",
        name: uname,
        pass: pwd
    });

    target.replaceWith(`<div class="logincontainer">
        <p class="labels">USERNAME</p>
        <input type="text" placeholder="Enter Username" class="unameinput" required>
        <p class="labels">PASSWORD</p>
        <input type="password" placeholder="Enter Password" class="password" required>
        <button class="button loginsubmit" type="submit">LOGIN</button>
        <button class="button newuser" type="submit">NEW USER</button>
        </div>`)


    return true;


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
}