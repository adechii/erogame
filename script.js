
const canvas = document.querySelector('#canvas')
const leftButton = document.querySelector('#left-button')
const rightButton = document.querySelector('#right-button')
const jumpButton = document.querySelector('#jump-button')
const playerImage = document.querySelector('#player-image')
const enemyImage = document.querySelector('#enemy-image')
const playerSelectButton = document.querySelector('#player-select')
const enemySelectButton = document.querySelector('#enemy-select')

const playerSelect = document.createElement('input')
playerSelect.type = 'file'
const enemySelect = document.createElement('input')
enemySelect.type = 'file'

const context = canvas.getContext("2d");

let start = false

let player = {
    x: 0,
    y: 0,
    w: 128,
    h: 128,
    vx: 0,
    vy: 0,
    ay: 0.2,
    sx: 0,
    sy: 0,
    left: false,
    animation: 0,
    eaten: 0,
}
let enemy = {
    x: 640,
    y: 0,
    w: 128,
    h: 128,
    vx: -0.5,
    vy: 0,
    ay: 0.2,
    sx: 0,
    sy: 0,
    left: true,
    animation: 0,
    live: true,
}


// フレームの繰り返し
let prevTimestamp = 0, lag = 0
const frame = (timestamp) => {
    requestAnimationFrame(frame)
    if(prevTimestamp === 0)prevTimestamp = timestamp
    lag = timestamp - prevTimestamp
    
    if(!start) return
    
    player.x += player.vx
    player.vy += player.ay
    player.y += player.vy
    
    enemy.x += enemy.vx
    enemy.vy += enemy.ay
    enemy.y += enemy.vy
    
    if(player.y + player.h > 480) {
        player.y = 480 - player.h
        player.vy = 0
    }
    if(enemy.y + enemy.h > 480) {
        enemy.y = 480 - enemy.h
        enemy.vy = 0
    }
    
    
    enemy.animation += 0.1
    
    if(player.vy < 0) {
        player.sx = 0
        player.sy = player.h
    }
    if(player.vy > 0) {
        player.sx = player.w
        player.sy = player.h
    }
    if(player.vy === 0 && player.vx === 0) {
        player.animation = 0
        player.sx = 0
        player.sy = 0
    }
    if(player.vy === 0 && player.vx !== 0) {
        player.animation += 0.1
        player.sx = player.w * Math.floor(player.animation % 2)
        player.sy = 0
    }
    
    // 操作
    if(player.eaten === 0) {
        if (arrowKey === 'left') {
            player.vx = -1
            player.left = true
        }
        if (arrowKey === 'right') {
            player.vx = 1
            player.left = false
        }
        if (upKey === 'jump' && player.y === 480 - player.h) player.vy = -8
        if (arrowKey === '') {
            player.vx = 0
        }
    }
    
    // 食べた
    if(
        enemy.x <= player.x + player.w &&
        enemy.y <= player.y + player.h &&
        enemy.x + enemy.w > player.x &&
        enemy.y + enemy.h > player.y &&
        player.eaten === 0 &&
        enemy.live
    ) {
        if(player.vy <= 0) player.eaten = 256
        else {
            enemy.live = false
            player.vy = -player.vy
        }
    }
    
    // 食べてる
    if (player.eaten){
        enemy.vx = 0
        enemy.sx = enemy.w * Math.floor(enemy.animation % 2)
        enemy.sy = enemy.h
    }
    // 食べてない
    else{
        enemy.vx = -0.5
        enemy.sx = enemy.w * Math.floor(enemy.animation % 2)
        enemy.sy = 0
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.save()
    if(player.eaten === 0) {
        if(player.left) context.scale(-1, 1)
        context.drawImage(
            playerImage,
            player.sx,
            player.sy,
            player.w,
            player.h,
            player.left ? -player.w - Math.floor(player.x) : Math.floor(player.x),
            Math.floor(player.y),
            player.w,
            player.h,
        )
        context.restore()
    } else {
        context.fillStyle = '#F00'
        context.fillRect(
            Math.floor(enemy.x + enemy.w / 2 - player.eaten / 2),
            Math.floor(enemy.y - 32),
            player.eaten,
            16)
    }
    
    if(enemy.live) {
        context.save()
        if(enemy.left) context.scale(-1, 1)
        context.drawImage(
            enemyImage,
            enemy.sx,
            enemy.sy,
            enemy.w,
            enemy.h,
            enemy.left ? -enemy.w - Math.floor(enemy.x) : Math.floor(enemy.x),
            Math.floor(enemy.y),
            enemy.w,
            enemy.h,
        )
        context.restore()
    }
    
    prevTimestamp = timestamp
}
requestAnimationFrame(frame)



// キーボードの取得
let arrowKey = ''
let upKey = ''
const keydown = (e) => {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') arrowKey = 'left'
    if (e.code === 'KeyD' || e.code === 'ArrowRight') arrowKey = 'right'
    if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        upKey = 'jump'
        if(!start) {
            start = true
            player.x = 0
            player.y = 0
            enemy.x = 640
            enemy.y = 0
        }
    }
    if (
        (
            e.code === 'KeyA' || e.code === 'ArrowLeft' ||
            e.code === 'KeyD' || e.code === 'ArrowRight'
        ) &&
        player.eaten > 0
    ) {
        player.eaten -= 16
        if(player.eaten <= 0) player.x = enemy.x - player.w * 2
    }
}
const keyup = (e) => {
    if (e.code == 'KeyA' || e.code == 'ArrowLeft' ||
        e.code == 'KeyD' || e.code == 'ArrowRight') {
        arrowKey = ''
    }
    if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        upKey = ''
    }
}
document.addEventListener('keydown', keydown)
document.addEventListener('keyup', keyup)

// ボタンの取得
const downButton = (e) => {
    if(e.target.id === 'left-button') arrowKey = 'left'
    if(e.target.id === 'right-button') arrowKey = 'right'
    if(e.target.id === 'jump-button') {
        upKey = 'jump'
        if(!start) {
            start = true
            player.x = 0
            player.y = 0
            enemy.x = 640
            enemy.y = 0
        }
    }
    if (
        (
            e.target.id === 'left-button' ||
            e.target.id === 'right-button'
        ) &&
        player.eaten > 0
    ) {
        player.eaten -= 16
        if(player.eaten <= 0) player.x = enemy.x - enemy.w * 2
    }
}
const upButton = (e) => {
    if(e.target.id === 'left-button') arrowKey = ''
    if(e.target.id === 'right-button') arrowKey = ''
    if(e.target.id === 'jump-button') upKey = ''
}
leftButton.addEventListener('pointerdown', downButton)
rightButton.addEventListener('pointerdown', downButton)
jumpButton.addEventListener('pointerdown', downButton)
leftButton.addEventListener('pointerup', upButton)
rightButton.addEventListener('pointerup', upButton)
jumpButton.addEventListener('pointerup', upButton)

// ファイル選択
const selectPlayer = (e) => {
    playerSelect.click()
}
const selectEnemy = (e) => {
    enemySelect.click()
}
playerSelectButton.addEventListener('click', selectPlayer)
enemySelectButton.addEventListener('click', selectEnemy)

// 画像変更
const changePlayer = (e) => {
	const blobUrl = URL.createObjectURL( e.target.files[0] )
    playerImage.src = blobUrl
    playerSelectButton.value = blobUrl
    start = false
}
const changeEnemy = (e) => {
	const blobUrl = URL.createObjectURL( e.target.files[0] )
    enemyImage.src = blobUrl
    enemySelectButton.value = blobUrl
    start = false
}
playerSelect.addEventListener('change', changePlayer, false)
enemySelect.addEventListener('change', changeEnemy, false)

// 画像の読み込み完了
const loadPlayer = (e) => {
    player.w = playerImage.width / 2
    player.h = playerImage.height / 2
}
const loadEnemy = (e) => {
    enemy.w = enemyImage.width / 2
    enemy.h = enemyImage.height / 2
}
playerImage.addEventListener('load', loadPlayer)
enemyImage.addEventListener('load', loadEnemy)

// 長押し禁止
window.addEventListener('contextmenu', (e) => {
     event.preventDefault();
     event.stopPropagation();
     return false;
}, { passive: false })
// ダブルタップ禁止
window.addEventListener('dblclick', (e) => {
     event.preventDefault();
     event.stopPropagation();
     return false;
}, { passive: false })