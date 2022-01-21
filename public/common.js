document.addEventListener('DOMContentLoaded', function(){
    const btns = document.querySelectorAll(`.add-to-observe`);
    const typesBtn = {
        add: {
            text: 'remove from observe',
            type: 'remove'
        },
        remove: {
            text: 'add to observe',
            type: 'add'
        }
    };

    const postData = async (data = {}, url = 'http://localhost:3000/observe-app') => {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        });
        return await response.json();
    };

    const addToObserveApp = (e) => {
        const btn = e.currentTarget;
        const appId = btn.getAttribute('data-app-id');
        const appEventType = btn.getAttribute('data-event-type');
        postData({appId, appEventType}).then((data => {
            console.log(data);
            btn.setAttribute('data-event-type', typesBtn[appEventType].type);
            btn.innerText = typesBtn[appEventType].text;
        }));
    };

    btns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            addToObserveApp(e);
        });
    })
});