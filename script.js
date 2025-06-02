const divcardservers = document.getElementById('cardservers');
const divcardserversempty = document.getElementById('empty-div');
const textcontent = document.getElementById('textcontent');
let checkload = false;
function checkcontainercard(){
    if(divcardservers.children.length === 0){
        textcontent.textContent = 'Ваш список серверов пуст!'
        divcardservers.classList.add('empty');
        divcardservers.appendChild(divcardserversempty);
    }
    else if(divcardservers.children.length > 1){
        divcardserversempty.remove();
        divcardservers.classList.remove('empty');
        divcardservers.classList.add('exsited');
        const elementsip = document.querySelectorAll('.ipptext');
        elementsip.forEach(element => {
            element.addEventListener('click', function() {
                navigator.clipboard.writeText(element.textContent);
            });
        });
    }
}
document.addEventListener('DOMContentLoaded', ()=>{
    const loader = document.getElementById('background-loader');
    loader.classList.add('background-loader-active');
    inittheme();
    loadCards();
    checkcontainercard();
})

const checkboxtheme = document.getElementById('checkboxtheme');
function changetheme(theme){
    localStorage.setItem('theme', theme);
    document.documentElement.className = theme;
}
function inittheme(){
    if (!localStorage.getItem('theme')){
        changetheme('light-theme');
    }
    else{
        const theme = localStorage.getItem('theme');
        changetheme(theme);
        if(theme === 'light-theme'){
            checkboxtheme.checked = false;
        }
        else{
            checkboxtheme.checked = true;
        }
    }
}
function toggletheme(){
    if(localStorage.getItem('theme')==='dark-theme'){
        changetheme('light-theme');
    }
    else{
        changetheme('dark-theme');
    }
}
const butaddserver = document.getElementById('addserver');
const modalwindow = document.getElementById('modal');
const mainmodal = document.getElementById('mainmodal');
butaddserver.addEventListener('click', ()=>{
    modalwindow.classList.add('active');
    mainmodal.classList.add('activemodal');
})
window.onclick = function(event){
    if (event.target == modalwindow){
        modalwindow.classList.remove('active');
        mainmodal.classList.remove('activemodal');
    }
}
function closemodal(){
    modalwindow.classList.remove('active');
    mainmodal.classList.remove('activemodal');
}
const buttonmodal = document.getElementById('buttonmodal');
const notify = document.getElementById('notify');
buttonmodal.addEventListener('click', ()=>{
    const loader = document.getElementById('background-loader');
    loader.classList.add('background-loader-active');
    const serverip = document.getElementById('ip').value.toLowerCase();
    if(serverip === ''){
        notify.textContent = 'Не указан IP сервера!';
        notify.classList.add('error');
        loader.classList.remove('background-loader-active');
        setTimeout(()=>{
            notify.classList.remove('error');
        }, 2000);
        return;
    }
    const fullapi = `https://api.mcstatus.io/v2/status/java/${serverip}`;
    const apiicon = `https://api.mcstatus.io/v2/icon/${serverip}`;
    Promise.all([
    fetch(fullapi).then(response => response.json()),
    fetch(apiicon).then(response => response.blob())
    ])
    .then(([ServerData, IconData]) => {
        notify.textContent = 'Успешно!';
        notify.classList.add('succesful');
        const iconObjectUrl = URL.createObjectURL(IconData);
        const ipServer = ServerData.host;
        const statusServer = ServerData.online;
        const serverOnline = ServerData.players.online;
        const sereverOnlineMax = ServerData.players.max;
        const serverVersion = ServerData.version.name_clean;
        let serverExists = false;
        const cardElement = document.querySelectorAll('.ipptext');
        cardElement.forEach(element => {
            if(element.textContent === ipServer){
                notify.textContent = 'У вас уже добавлен этот сервер!';
                notify.classList.add('error');
                loader.classList.remove('background-loader-active');
                notify.classList.remove('succesful');
                setTimeout(()=>{
                    notify.classList.remove('error');
                }, 2000);
                serverExists = true;
            }
        });
        if (serverExists) {
            return;
        }
        ID='';
        ServerName='';
        createcard(iconObjectUrl, ipServer, statusServer, serverOnline, sereverOnlineMax, serverVersion, ID, ServerName);
        checkcontainercard();
        loader.classList.remove('background-loader-active');
        setTimeout(()=>{
            notify.classList.remove('succesful');
        }, 2000);
    })
    .catch(() => {
        notify.textContent = 'Ошибка! Некорректный IP или такого сервера не существует!';
        notify.classList.add('error');
        loader.classList.remove('background-loader-active');
        notify.classList.remove('succesful');
        setTimeout(()=>{
            notify.classList.remove('error');
        }, 2000);
        return;
    });
})

function createcard(iconObjectUrl, ipServer, statusServer, serverOnline, sereverOnlineMax, serverVersion, ID, ServerName) {
    const container = document.getElementById('cardservers');
    const img = document.createElement('img');
    img.src = `${iconObjectUrl}`;
    const card = document.createElement('div');
    card.draggable = true;
    card.className = 'servercard';
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragend', handleDragEnd);
    let cardId;
    if(ID === ''){
        cardId = Date.now();
    }
    else{
        cardId = ID;
    }
    card.dataset.id = cardId; 
    card.appendChild(img);
    const divstatus = document.createElement('div');
    divstatus.className = 'status';
    card.appendChild(divstatus);
    const nameserver = document.createElement('input');
    nameserver.className = 'nameserver';
    nameserver.placeholder = 'Введите название';
    nameserver.dataset.id = cardId;
    nameserver.value = ServerName;
    nameserver.addEventListener('keydown', (event)=>{
        if(event.key === 'Enter'){
            event.preventDefault();
            nameserver.blur();
        }
    })
    nameserver.addEventListener('blur', ()=>{
        saveCard(card, statusServer);
        notify.textContent = 'Сохранено!';
        notify.classList.add('succesful');
        setTimeout(()=>{
            notify.classList.remove('succesful');
        }, 2000);
    });
    divstatus.appendChild(nameserver);
    const divOnline = document.createElement('div');
    divOnline.className = 'divOnline';
    divstatus.appendChild(divOnline);
    const online = document.createElement('span');
    if(statusServer == 'true'){
        online.className = 'online';
    }else{
        online.className = 'online';
    }
    divOnline.appendChild(online);
    const onlineText = document.createElement('p');
    if(statusServer === true){
        onlineText.textContent = 'Онлайн';
        onlineText.className = 'onlineText';
    }else{
        onlineText.textContent = 'Оффлайн';
        onlineText.className = 'offlineText';
    }
    divOnline.appendChild(onlineText);
    const ipplay = document.createElement('div');
    divstatus.appendChild(ipplay);
    const ipplaytext = document.createElement('p');
    ipplaytext.className = 'ipptext';
    ipplaytext.textContent = ipServer;
    ipplay.appendChild(ipplaytext);
    const onlinecount = document.createElement('div');
    onlinecount.className = 'online-count';
    divstatus.appendChild(onlinecount);
    const onlinecounttext = document.createElement('p');
    onlinecounttext.className = 'online-count-text';
    onlinecounttext.textContent = `${serverOnline}/${sereverOnlineMax} Онлайн`;
    onlinecount.appendChild(onlinecounttext);
    const version = document.createElement('div');
    version.className = 'version';
    divstatus.appendChild(version);
    const versiontext = document.createElement('p');
    versiontext.className = 'version-text';
    versiontext.textContent = `Версия: ${serverVersion}`;
    version.appendChild(versiontext);
    const divbuttons = document.createElement('div');
    divbuttons.className = 'div-buttons';
    card.appendChild(divbuttons);
    const updatebutton = document.createElement('button');
    updatebutton.className = 'update-button';
    updatebutton.dataset.id = cardId;
    updatebutton.textContent = 'Обновить';
    divbuttons.appendChild(updatebutton);
    const delbutton = document.createElement('button');
    delbutton.className = 'delete-button';
    delbutton.dataset.id = cardId;
    delbutton.textContent = 'Удалить';
    delbutton.addEventListener('click', () => {
        container.removeChild(card);
        delCard(cardId);
        checkcontainercard();
    });
    updatebutton.addEventListener('click', ()=>{
        const loader = document.getElementById('background-loader');
        loader.classList.add('background-loader-active');
        const serverip1 = ipplaytext.textContent;
        console.log(serverip1);
        if(serverip1 === ''){
            notify.textContent = 'Не указан IP сервера!';
            notify.classList.add('error');
            loader.classList.remove('background-loader-active');
            setTimeout(()=>{
                notify.classList.remove('error');
            }, 2000);
            return;
        }
        const fullapi1 = `https://api.mcstatus.io/v2/status/java/${serverip1}`;
        const apiicon1 = `https://api.mcstatus.io/v2/icon/${serverip1}`;
        Promise.all([
        fetch(fullapi1).then(response => response.json()),
        fetch(apiicon1).then(response => response.blob())
        ])
        .then(([ServerData1, IconData1]) => {
            notify.textContent = 'Обновлено!';
            notify.classList.add('succesful');
            const iconObjectUrl1 = URL.createObjectURL(IconData1);
            const ipServer1 = ServerData1.host;
            const statusServer1 = ServerData1.online;
            const serverOnline1 = ServerData1.players.online;
            const sereverOnlineMax1 = ServerData1.players.max;
            const serverVersion1 = ServerData1.version.name_clean;
            img.src = `${iconObjectUrl1}`;
            ipplaytext.textContent = ipServer1;
            if(statusServer1 == 'true'){
                online.className = 'online';
            }else{
                online.className = 'online';
            }
            if(statusServer1 === true){
                onlineText.textContent = 'Онлайн';
                onlineText.className = 'onlineText';
            }else{
                onlineText.textContent = 'Оффлайн';
                onlineText.className = 'offlineText';
            }
            onlinecounttext.textContent = `${serverOnline1}/${sereverOnlineMax1} Онлайн`;
            versiontext.textContent = `Версия: ${serverVersion1}`;
            saveCard(card, statusServer1);
            loader.classList.remove('background-loader-active');
            setTimeout(()=>{
                notify.classList.remove('succesful');
            }, 2000);
            checkcontainercard();
        })
        .catch(() => {
            notify.textContent = 'Ошибка!';
            notify.classList.add('error');
            loader.classList.remove('background-loader-active');
            notify.classList.remove('succesful');
            setTimeout(()=>{
                notify.classList.remove('error');
            }, 2000);
            return;
        });
    });
    divbuttons.appendChild(delbutton);
    container.appendChild(card);
    if(checkload === false){
        saveCard(card, statusServer);
    } 
}
function delCard(cardId) {
    let cards = JSON.parse(localStorage.getItem('cards')) || [];
    cards = cards.filter(card => card.id !== cardId.toString());
    localStorage.setItem('cards', JSON.stringify(cards));
    checkcontainercard();
    notify.textContent = 'Удалено!';
    notify.classList.add('error');
    notify.classList.remove('succesful');
    setTimeout(()=>{
        notify.classList.remove('error');
    }, 2000);
}

function saveCard(card, statusServer) {
    const cardsArray = JSON.parse(localStorage.getItem('cards')) || [];
    const cardData = {
        id: card.dataset.id,
        name: card.querySelector('.nameserver').value,
        status: statusServer,
        ip: card.querySelector('.ipptext').textContent,
        online: card.querySelector('.online-count-text').textContent,
        version: card.querySelector('.version-text').textContent,
    };
    const existingCardIndex = cardsArray.findIndex(c => c.id === cardData.id);
    if (existingCardIndex !== -1) {
        cardsArray[existingCardIndex] = cardData;
    } else {
        cardsArray.push(cardData);
    }
    localStorage.setItem('cards', JSON.stringify(cardsArray));
}
async function loadCards() {
    const loader = document.getElementById('background-loader');
    checkload = true;
    const cardsArray = JSON.parse(localStorage.getItem('cards')) || [];
    const cardPromises = cardsArray.map(async cardData => {
        const iconObjectUrl = await getIcon(cardData.ip);
        createcard(
            iconObjectUrl,
            cardData.ip,
            cardData.status,
            cardData.online.split('/')[0],
            cardData.online.split('/')[1].replace('Онлайн', ''),
            cardData.version.replace('Версия: ', ''),
            cardData.id,
            cardData.name
        );
    });
    await Promise.all(cardPromises);
    const container = document.getElementById('cardservers');
    const cards = Array.from(container.children);
    const sortedCards = cardsArray.map(cardData => {
        return cards.find(card => card.dataset.id === cardData.id);
    }).filter(card => card);
    container.innerHTML = '';
    sortedCards.forEach(card => container.appendChild(card));
    checkload = false;
    checkcontainercard();
    notify.textContent = 'Добро пожаловать!';
    notify.classList.add('succesful');
    loader.classList.remove('background-loader-active');
    setTimeout(()=>{
        notify.classList.remove('succesful');
    }, 2000);
}

async function getIcon(serverip) {
    const apiicon = `https://api.mcstatus.io/v2/icon/${serverip}`;
    const response = await fetch(apiicon);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const iconData = await response.blob();
    return URL.createObjectURL(iconData);
}

let draggedCard = null;

function handleDragStart(e) {
    draggedCard = e.target.closest('.servercard');
    e.target.style.opacity = '0.5';
}

function handleDragOver(e) {
    e.preventDefault();
    const targetCard = e.target.closest('.servercard');
    if (!targetCard || targetCard === draggedCard) return;
    const container = document.getElementById('cardservers');
    const cards = Array.from(container.children);
    const targetIndex = cards.indexOf(targetCard);
    const draggedIndex = cards.indexOf(draggedCard);
    if (draggedIndex < targetIndex) {
        container.insertBefore(draggedCard, targetCard.nextSibling);
    } else {
        container.insertBefore(draggedCard, targetCard);
    }
}

function handleDrop(e) {
    e.preventDefault();
    updateCardsOrder();
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
    updateCardsOrder();
}

function updateCardsOrder() {
    const container = document.getElementById('cardservers');
    const cards = Array.from(container.children);
    const cardsArray = JSON.parse(localStorage.getItem('cards')) || [];
    const newCardsArray = cards.map(card => {
        return cardsArray.find(c => c.id === card.dataset.id);
    }).filter(c => c);
    localStorage.setItem('cards', JSON.stringify(newCardsArray));
    checkcontainercard();
}
const search = document.querySelector('.search');
search.addEventListener('keyup', () => {
    const cardsSearch = document.querySelectorAll('.servercard');
    const query = search.value.toLowerCase();
    let count = cardsSearch.length;
    cardsSearch.forEach(card2 => {
        const textSearch = card2.querySelector('.nameserver'); 
        if (textSearch.value.toLowerCase().includes(query)) {
            card2.classList.remove('hide'); 
        } 
        else {
            card2.classList.add('hide');
            count--;
        }
    });
    if(count===0){
        divcardservers.classList.add('empty');
        textcontent.textContent = 'Нет такого сервера в списке :с';
        divcardservers.appendChild(divcardserversempty);
    }
    else{
        divcardserversempty.remove();
        textcontent.textContent = 'Ваш список серверов пуст!';
        divcardservers.classList.remove('empty');
        divcardservers.classList.add('exsited');
    }
});
async function BackCards() {
    checkload = true;
    const cardsArray = JSON.parse(localStorage.getItem('cards')) || [];
    const cardPromises = cardsArray.map(async cardData => {
        const iconObjectUrl = await getIcon(cardData.ip);
        createcard(
            iconObjectUrl,
            cardData.ip,
            cardData.status,
            cardData.online.split('/')[0],
            cardData.online.split('/')[1].replace('Онлайн', ''),
            cardData.version.replace('Версия: ', ''),
            cardData.id,
            cardData.name
        );
    });
    await Promise.all(cardPromises);
    const container = document.getElementById('cardservers');
    const cards = Array.from(container.children);
    const sortedCards = cardsArray.map(cardData => {
        return cards.find(card => card.dataset.id === cardData.id);
    }).filter(card => card);
    container.innerHTML = '';
    sortedCards.forEach(card => container.appendChild(card));
    checkload = false;
    checkcontainercard();
}
let isSorted = true;
let countsort=0;
const sortBut = document.getElementById('sorted');
function sorted(){
    const container = document.getElementById('cardservers');
    countsort++;
    if(countsort === 3){
        sortBut.textContent = 'Отсортировать по онлайну ▲/▼'
        countsort = 0;
        BackCards();
        return;
    }
    const cards = Array.from(container.querySelectorAll('.servercard'));
        cards.sort((a, b) => {
        const textA = a.querySelector('.online-count-text').textContent;
        const textB = b.querySelector('.online-count-text').textContent;
        const onlineA = parseInt(textA.split('/')[0], 10);
        const onlineB = parseInt(textB.split('/')[0], 10);
        return isSorted ? onlineA - onlineB : onlineB - onlineA;
    });
    cards.forEach(card => container.appendChild(card));
    if(isSorted === true){
        sortBut.textContent = 'Отсортировать по онлайну ▲';
    }
    if(isSorted === false){
        sortBut.textContent = 'Отсортировать по онлайну ▼'
    }
    isSorted = !isSorted;
}
