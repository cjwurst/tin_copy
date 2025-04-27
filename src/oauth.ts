document.addEventListener("DOMContentLoaded", function() {
    this.querySelector('button')?.addEventListener('click', function () {
        chrome.identity.getAuthToken({interactive: true}, function(token) {
            console.log(token);
        });
    });
});