
//----------------------keymap
// BẢN ĐÃ SỬA cho test/letmecook
// Thay đổi so với bản gốc:
//  - Chuẩn hoá e.key về chữ thường trước khi switch (sửa lỗi Q/E chỉ chạy khi Shift).
//  - Thêm WASD (w/a/s/d) -> -1/-3/-2/-4  (UP/LEFT/DOWN/RIGHT).
//  - Thêm Space -> -5 (FIRE).
//  - Thêm Z -> 122 (GAME_C=11), C -> 99 (GAME_D=12).
//  - Giữ nguyên Q/E -> -6/-7 và mọi xử lý chuột/chạm, upload file của bản gốc.
var keyDownTime_Star = 0

function handleKeydown(e) {
    if (e.key != "EndCall" && e.key != "Backspace") {
        //e.preventDefault();//清除默认行为（滚动屏幕等）
    }
    // Chuẩn hoá: chữ cái 1 ký tự -> thường; các key đặc biệt (ArrowUp, SoftLeft...) giữ nguyên
    var k = (e.key && e.key.length === 1) ? e.key.toLowerCase() : e.key;
    switch (k) {
        case 'arrowup':
        case 'w':
            MIDP.sendKeyPress(-1);
            break;
        case 'arrowdown':
        case 's':
            MIDP.sendKeyPress(-2);
            break;
        case 'arrowright':
        case 'd':
            MIDP.sendKeyPress(-4);
            break;
        case 'arrowleft':
        case 'a':
            MIDP.sendKeyPress(-3);
            break;
        case 'enter':
        case ' ': // Space = FIRE
            MIDP.sendKeyPress(-5);
            break;
        case 'backspace':
            break;
        case 'q':
        case 'softleft':
            MIDP.sendKeyPress(-6);
            break;
        case 'e':
        case 'softright':
            MIDP.sendKeyPress(-7);
            break;
        case 'z':
            MIDP.sendKeyPress(122); // GAME_C (gameKeys 122->11)
            break;
        case 'c':
            MIDP.sendKeyPress(99);  // GAME_D (gameKeys 99->12)
            break;
        case '0':
            MIDP.sendKeyPress(48);
            break;
        case '1':
            MIDP.sendKeyPress(49);
            break; case '2':
            MIDP.sendKeyPress(50);
            break; case '3':
            MIDP.sendKeyPress(51);
            break; case '4':
            MIDP.sendKeyPress(52);
            break; case '5':
            MIDP.sendKeyPress(53);
            break; case '6':
            MIDP.sendKeyPress(54);
            break; case '7':
            MIDP.sendKeyPress(55);
            break; case '8':
            MIDP.sendKeyPress(56);
            break; case '9':
            MIDP.sendKeyPress(57);
            break;
        case '*':
            if (keyDownTime_Star == 0) {
                keyDownTime_Star = Date.now()
            }
            MIDP.sendKeyPress(42);
            break;
        case '#':
            MIDP.sendKeyPress(35);
            break;
    }
}


function handleKeyup(e) {
    if (e.key != "EndCall" && e.key != "Backspace") {
        e.preventDefault();//清除默认行为（滚动屏幕等）
    }
    var k = (e.key && e.key.length === 1) ? e.key.toLowerCase() : e.key;
    switch (k) {
        case 'arrowup':
        case 'w':
            MIDP.sendKeyRelease(-1);
            break;
        case 'arrowdown':
        case 's':
            MIDP.sendKeyRelease(-2);
            break;
        case 'arrowright':
        case 'd':
            MIDP.sendKeyRelease(-4);
            break;
        case 'arrowleft':
        case 'a':
            MIDP.sendKeyRelease(-3);
            break;
        case 'enter':
        case ' ': // Space
            MIDP.sendKeyRelease(-5);
            break;
        case 'backspace':
            break;
        case 'q':
        case 'softleft':
            MIDP.sendKeyRelease(-6);
            break;
        case 'e':
        case 'softright':
            MIDP.sendKeyRelease(-7);
            break;
        case 'z':
            MIDP.sendKeyRelease(122);
            break;
        case 'c':
            MIDP.sendKeyRelease(99);
            break;
        case '0':
            MIDP.sendKeyRelease(48);
            break;
        case '1':
            MIDP.sendKeyRelease(49);
            break; case '2':
            MIDP.sendKeyRelease(50);
            break; case '3':
            MIDP.sendKeyRelease(51);
            break; case '4':
            MIDP.sendKeyRelease(52);
            break; case '5':
            MIDP.sendKeyRelease(53);
            break; case '6':
            MIDP.sendKeyRelease(54);
            break; case '7':
            MIDP.sendKeyRelease(55);
            break; case '8':
            MIDP.sendKeyRelease(56);
            break; case '9':
            MIDP.sendKeyRelease(57);
            break;
        case '*':
            if (Date.now() - keyDownTime_Star > 1000) {
                document.getElementById("File").click();
            }
            keyDownTime_Star = 0
            MIDP.sendKeyRelease(42);
            break;
        case '#':
            MIDP.sendKeyRelease(35);
            break;
    }
}

//document.οnkeydοwn=handleKeydown;
//document.οnkeyup=handleKeyup;
window.addEventListener('keydown', handleKeydown);
window.addEventListener('keyup', handleKeyup);

var SupportsTouches =('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;//判断是否支持触摸

StartEvent = SupportsTouches ? "touchstart" : "mousedown",//支持触摸式使用相应的事件替代

EndEvent = SupportsTouches ? "touchend" : "mouseup";

console.log(SupportsTouches,StartEvent,EndEvent);

function isGamepadButton(el) {
    return el && (el.tagName === 'BUTTON' || (el.closest && el.closest('#gamepad')));
}

window.addEventListener(StartEvent, function (e) {
    e = e || window.event;
    var button = e.srcElement || e.target;
    var content = button.innerText;
    // Visual press effect: chỉ cho nút bàn phím ảo, KHÔNG cho vùng màn hình game
    if (isGamepadButton(button)) {
        try { button.classList.add('pressed'); button.style.transform = 'scale(0.93)'; } catch(ex) {}
    }

    switch (content) {
        case 'up':
            MIDP.sendKeyPress(-1);
            break;
        case 'down':
            MIDP.sendKeyPress(-2);
            break;
        case 'right':
            MIDP.sendKeyPress(-4);
            break;
        case 'left':
            MIDP.sendKeyPress(-3);
            break;
        case 'OK':
            MIDP.sendKeyPress(-5);
            break;
        case 'L':
            MIDP.sendKeyPress(-6);
            break;
        case 'R':
            MIDP.sendKeyPress(-7);
            break;
        case 'C':
            MIDP.sendKeyPress(122);
            break;
        case 'D':
            MIDP.sendKeyPress(99);
            break;
        case '0':
            MIDP.sendKeyPress(48);
            break;
        case '1':
            MIDP.sendKeyPress(49);
            break; case '2':
            MIDP.sendKeyPress(50);
            break; case '3':
            MIDP.sendKeyPress(51);
            break; case '4':
            MIDP.sendKeyPress(52);
            break; case '5':
            MIDP.sendKeyPress(53);
            break; case '6':
            MIDP.sendKeyPress(54);
            break; case '7':
            MIDP.sendKeyPress(55);
            break; case '8':
            MIDP.sendKeyPress(56);
            break; case '9':
            MIDP.sendKeyPress(57);
            break;
        case '*':
            if (keyDownTime_Star == 0) {
                keyDownTime_Star = Date.now()
            }
            MIDP.sendKeyPress(42);
            break;
        case '#':
            MIDP.sendKeyPress(35);
            break;
    }

});

window.addEventListener(EndEvent, function (e) {
    e = e || window.event;
    var button = e.srcElement || e.target;
    var content = button.innerText;
    // Visual release effect: chỉ cho nút bàn phím ảo, KHÔNG cho vùng màn hình game
    if (isGamepadButton(button)) {
        try { button.classList.remove('pressed'); button.style.transform = ''; } catch(ex) {}
    }
    switch (content) {
        case 'up':
            MIDP.sendKeyRelease(-1);
            break;
        case 'down':
            MIDP.sendKeyRelease(-2);
            break;
        case 'right':
            MIDP.sendKeyRelease(-4);
            break;
        case 'left':
            MIDP.sendKeyRelease(-3);
            break;
        case 'OK':
            MIDP.sendKeyRelease(-5);
            break;
        case 'L':
            MIDP.sendKeyRelease(-6);
            break;
        case 'R':
            MIDP.sendKeyRelease(-7);
            break;
        case 'C':
            MIDP.sendKeyRelease(122);
            break;
        case 'D':
            MIDP.sendKeyRelease(99);
            break;
        case '0':
            MIDP.sendKeyRelease(48);
            break;
        case '1':
            MIDP.sendKeyRelease(49);
            break; case '2':
            MIDP.sendKeyRelease(50);
            break; case '3':
            MIDP.sendKeyRelease(51);
            break; case '4':
            MIDP.sendKeyRelease(52);
            break; case '5':
            MIDP.sendKeyRelease(53);
            break; case '6':
            MIDP.sendKeyRelease(54);
            break; case '7':
            MIDP.sendKeyRelease(55);
            break; case '8':
            MIDP.sendKeyRelease(56);
            break; case '9':
            MIDP.sendKeyRelease(57);
            break;
        case '*':
            if (Date.now() - keyDownTime_Star > 1000) {
                document.getElementById("File").click();
            }
            keyDownTime_Star = 0
            MIDP.sendKeyRelease(42);
            break;
        case '#':
            MIDP.sendKeyRelease(35);
            break;
    }

});



//-----------------------keymap
const onUploadFile = function(e){
    const _files = e.target.files;
    if (_files.length == 0) {
        return;
    }
    const _file = _files[0];
    fs.createUniqueFile("/Phone",_file.name,_file)
};

window.addEventListener("load", function(){
    document.getElementById("File").addEventListener("change", onUploadFile);
})
