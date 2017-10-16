//-------- ïœêî --------//
var name_DB_user = "el_user";

var token_url = '';
var token_user_name = '';
var token_user_score = 0;
var token_user_number = -1;
var token_ID = 0;
var token_question_ID = 0;
var token_question_source = '';
var token_question_translation = '';
var token_question_progress = 0;

var phase = 0;

var array_user = [];
var array_question = new Array();

var token_order = 0;
var token_myorder = -1;
var token_partner = '';

var temp_time = 0;

var loopStart = 0;
var loopLimit = 3000;
var loopCount = 10;
var loopInterval = 100;
//-------- ä÷êî --------//
function getCourseURL() {
    return new Promise(function (resolve, reject) {
        if(!getCourseURL.cache) {
            var a = document.getElementsByClassName("breadcrumb")[0].getElementsByTagName("A");
            getCourseURL.cache = Array.prototype.reduce.call(a, function(r, e) {
                if(e.href.match('course/view[.]php[?]id=([0-9]+)')) {
                    r.push(e.href);
                }
                return r;
            }, [])[0];
        }
        resolve(getCourseURL.cache);
    });
}

function removeElement(e) {
  e.parentNode.removeChild(e);
  return e;
}

function injectIframe(url) {
    return new Promise(function (resolve, reject) {
        var timeout = true;
        var iframe = document.createElement("IFRAME");
        iframe.style.display = "none";
        iframe.style.width = "100%";
        iframe.src = url;
        iframe.onload = function (e) {
            timeout = false;
            resolve(iframe);
        }
        setTimeout(function () {
            if (timeout) {
                //reject("injectIframe: timeout: over " + injectIframe.timeout + "ms: " + url);
            }
        }, injectIframe.timeout);
        document.body.appendChild(iframe);
    });
}
injectIframe.timeout = 10000;

function GetName(iframe) {
    return new Promise(function (resolve) {
        var doc = iframe.contentDocument;
        var list_a = doc.getElementsByTagName('a');
        var ary_data = [];
        for(item_a of list_a) {
            if(item_a.href.match('profile.php')) {
                ary_data.push(item_a.textContent);
            }
        }
        resolve(ary_data.pop());
    });
}

function GetURL(course_url, pattern, page) {
    return new Promise(function (resolve, reject) {
        injectIframe(course_url).then(function (iframe) {
            var doc = iframe.contentDocument;
            var a = doc.getElementsByTagName("A");
            var href = Array.prototype.reduce.call(a, function (r, e) {
                if (e.textContent.match(pattern)) {
                    console.log(e.textContent);
                    r.push(e.href);
                }
                return r;
            }, [])[0];
            removeElement(iframe);
            console.log("url_result:"+href);
            if(page === 'edit') {
                href = href.replace(/view.php/g, "edit.php");
            }
            resolve(href);
        });
    });
}

function GetUserData(iframe, name) {
    //console.log("name:"+name);
    reg = new RegExp('^name:'+name);
    return new Promise(function (resolve) {
        var doc = iframe.contentDocument;
        var list_div = doc.getElementsByTagName('div');
        var entry = new Array();
        for(item_div of list_div) {
            if(item_div.textContent.match(reg)) {
                //console.log('data_header:\n'+item_div.textContent);
                fields = item_div.textContent.split(';')
                entry['name'] = fields[0].split(':')[1]
                entry['score'] = fields[1].split(':')[1]
            }
        }
        resolve(entry);
    });
}

function RegistUserData(iframe, name, score) {
    var ary_data = [score, name];
    var doc = iframe.contentDocument;
    var form = Array.prototype.reduce.call(doc.forms, function (r, e) {
        if (("" + e.action).match(/edit.php/)) r.push(e);
        return r;
    }, [])[0];
    for (key in form) {
        if(isNaN(key) == false && form[key].id.match(/field_/)) {
            form[form[key].id].value = ary_data.pop();
        }
    }
    return new Promise(function (resolve, reject) {
        iframe.onload = function (e) {
            resolve(iframe);
        }
        setTimeout(function () {
            //reject("submitNewdiscussion: timeout: over " + injectIframe.timeout + "ms: " + + iframe.src + ": " + form.action);
        }, injectIframe.timeout);
        form.submit();
   });
}

function RegistWaitUserData(iframe, name, score, roomID) {
    var ary_data = [roomID, score, name];
    var doc = iframe.contentDocument;
    var form = Array.prototype.reduce.call(doc.forms, function (r, e) {
        if (("" + e.action).match(/edit.php/)) r.push(e);
        return r;
    }, [])[0];
    for (key in form) {
        if(isNaN(key) == false && form[key].id.match(/field_/)) {
            form[form[key].id].value = ary_data.pop();
        }
    }
    return new Promise(function (resolve, reject) {
        iframe.onload = function (e) {
            resolve(iframe);
        }
        setTimeout(function () {
            //reject("submitNewdiscussion: timeout: over " + injectIframe.timeout + "ms: " + + iframe.src + ": " + form.action);
        }, injectIframe.timeout);
        form.submit();
   });  
}

function CountWaitUser(iframe, roomid) {
    var counter = 0;
    reg = new RegExp('^RoomID:'+roomid);
    return new Promise(function (resolve) {
        var doc = iframe.contentDocument;
        var list_div = doc.getElementsByTagName('div');
        for(item_div of list_div) {
            if(item_div.textContent.match(reg)) {
                counter ++;
            }
        }
        resolve(counter);
    });
}

function DeleteWaitUser(iframe, num) {
    return new Promise(function (resolve) {
        var doc = iframe.contentDocument;
        var list_a = doc.getElementsByTagName('a');
        for(item_a of list_a) {
            if(item_a.href.match(/delete=/)) {
                deletePage = item_a.href;
                injectIframe(deletePage)
                .then(function(iframe2) {
                    DelAct(iframe2);
                });
            }
        }
    });
}

function DelAct(iframe) {
    var doc = iframe.contentDocument;
    var form = Array.prototype.reduce.call(doc.forms, function (r, e) {
        if (("" + e.action).match(/\/view\.php/)) r.push(e);
        return r;
    }, [])[1];
    return new Promise(function (resolve, reject) {
        iframe.onload = function (e) {
            resolve(iframe);
        }
        setTimeout(function () {
            //reject("submitNewdiscussion: timeout: over " + injectIframe.timeout + "ms: " + + iframe.src + ": " + form.action);
        }, injectIframe.timeout);
        form.submit();
    }); 
}

function GetStudyInfo(iframe) {
    return new Promise(function (resolve) {
        var doc = iframe.contentDocument;
        var list_div = doc.getElementsByTagName('div');
        var info = new Array();
        for(item_div of list_div) {
            if(item_div.textContent.match(/^ID\:/)) {
                //console.log('data_header:\n'+item_div.textContent);
                fields = item_div.textContent.split(';');
                info['ID'] = fields[0].split(':')[1];
                info['Question'] = fields[1].split(':')[1];
            }
        }
        removeElement(iframe);
        resolve(info);
    });
}

function GetQuestion(iframe) {
    return new Promise(function (resolve) {
        var doc = iframe.contentDocument;
        var list_div = doc.getElementsByTagName('div');
        var info = new Array();
        for(item_div of list_div) {
            if(item_div.textContent.match(/ID\:/)) {
                //console.log('data_header:\n'+item_div.textContent);
                fields = item_div.textContent.split(';');
                info['ID'] = fields[0].split(':')[1];
                info['Source'] = fields[1].split(':')[1];
                info['Sentence'] = fields[2].split(':')[1];
                info['Translation'] = fields[3].split(':')[1];
            }
        }
        removeElement(iframe);
        resolve(info);
    });
}

function GetRoomData(iframe, id, name) {
    return new Promise(function (resolve) {
        var doc = iframe.contentDocument;
        var list_div = doc.getElementsByTagName('div');
        var info = new Array();
        for(item_div of list_div) {
            if(item_div.textContent.match(/ID\:/)) {
                //console.log('data_header:\n'+item_div.textContent);
                fields = item_div.textContent.split(';');
                if(id == fields[0].split(':')[1]) {
                    if(name == fields[1].split(':')[1]) {
                        token_myorder = 1;
                        token_partner = fields[2].split(':')[1];
                    } else if(name == fields[2].split(':')[1]) {
                        token_myorder = 0;
                        token_partner = fields[1].split(':')[1];
                    }
                }
            }
        }
        removeElement(iframe);
        resolve();
    });
}

function ChangeSort(iframe) {
    var doc = iframe.contentDocument;
    var form = Array.prototype.reduce.call(doc.forms, function (r, e) {
        //if (("" + e.action).match(/view.php/)) r.push(e);
        if (("" + e.id).match(/options/)) r.push(e);
        return r;
    }, [])[0];
    for (key in form) {
        if(isNaN(key) == false && form[key].id.match(/pref_perpage/)) {
            form[key].value = 1000;
        } else if(isNaN(key) == false && form[key].id.match(/pref_order/)) {
            form[key].value = 'DESC';
        }
    }
    return new Promise(function (resolve, reject) {
        iframe.onload = function (e) {
            removeElement(iframe);
            resolve();
        }
        setTimeout(function () {
            //reject("submitNewdiscussion: timeout: over " + injectIframe.timeout + "ms: " + + iframe.src + ": " + form.action);
        }, injectIframe.timeout);
        form.submit();
   });
}

function RegistSyncData(iframe, id, name) {
    var ary_data = [name, id];
    var doc = iframe.contentDocument;
    var form = Array.prototype.reduce.call(doc.forms, function (r, e) {
        if (("" + e.action).match(/edit.php/)) r.push(e);
        return r;
    }, [])[0];
    for (key in form) {
        if(isNaN(key) == false && form[key].id.match(/field_/)) {
            form[form[key].id].value = ary_data.pop();
        }
    }
    return new Promise(function (resolve, reject) {
        iframe.onload = function (e) {
            resolve(iframe);
        }
        setTimeout(function () {
            //reject("submitNewdiscussion: timeout: over " + injectIframe.timeout + "ms: " + + iframe.src + ": " + form.action);
        }, injectIframe.timeout);
        form.submit();
   });  
}

function GetSyncData(iframe, id, partner) {
    return new Promise(function (resolve) {
        var result = '';
        var doc = iframe.contentDocument;
        var list_div = doc.getElementsByTagName('div');
        var info = new Array();
        for(item_div of list_div) {
            if(item_div.textContent.match(/^ID\:/)) {
                //console.log('data_header:\n'+item_div.textContent);
                fields = item_div.textContent.split(';');
                //console.log(id - fields[0].split(':')[1])
                //console.log(partner+" vs "+fields[1].split(':')[1])
                if(id - fields[0].split(':')[1] == 0) {
                    console.log("ID checked");
                    console.log("Partner checked:"+fields[1].split(':')[1]);
                    if(partner == fields[1].split(':')[1]) {
                        result = 'true';
                        break;
                    } else {
                        result = 'false';
                    }
                } else {
                    result = 'false';
                }
            }
        }
        removeElement(iframe);
        resolve(result);
        //return result;
    });
}

function RegistAnswer(iframe, answer, id, user, turn) {
     var ary_data = [turn, answer, user, id];
     var doc = iframe.contentDocument;
     var form = Array.prototype.reduce.call(doc.forms, function (r, e) {
         if (("" + e.action).match(/edit.php/)) r.push(e);
         return r;
     }, [])[0];
     for (key in form) {
         if(isNaN(key) == false && form[key].id.match(/field_/)) {
             form[form[key].id].value = ary_data.pop();
         }
     }
     return new Promise(function (resolve, reject) {
         iframe.onload = function (e) {
             resolve(iframe);
         }
         setTimeout(function () {
             //reject("submitNewdiscussion: timeout: over " + injectIframe.timeout + "ms: " + + iframe.src + ": " + form.action);
         }, injectIframe.timeout);
         form.submit();
    });  
}

function GetAnswer(iframe, id, turn) {
    return new Promise(function (resolve) {
        var doc = iframe.contentDocument;
        var list_div = doc.getElementsByTagName('div');
        var latest_answer = '';
        for(item_div of list_div) {
            if(item_div.textContent.match(/^ID\:/)) {
                fields2 = item_div.textContent.split(';');
                console.log(id + ':' + fields2[0].split(':')[1] + ', ' + turn + ':' + fields2[3].split(':')[1]);
                if(id == fields2[0].split(':')[1] && turn < fields2[3].split(':')[1]) {
                    latest_answer = fields2[2].split(':')[1]
                }
            }
        }
        removeElement(iframe);
        resolve(latest_answer);
        //return result;
    });
}

function getQuestionDetail(iframe, ID) {
    return new Promise(function(resolve) {
        var doc = iframe.contentDocument;
        var list_div = doc.getElementsByTagName('div');
        var info = new Array();
        for(item_div of list_div) {
            if(item_div.textContent.match(/ID\:/)) {
                //console.log('data_header:\n'+item_div.textContent);
                fields = item_div.textContent.split(';');
                if(ID == fields[0].split(':')[1]) {
                    token_question_source = fields[1].split(':')[1];
                    token_question_translation = fields[3].split(':')[1];
                    temp_question = fields[2].split(':')[1]
                    for(ary_div of temp_question.split(' ')) {
                        array_question.push(ary_div);
                    }
                }
            }
        }
        removeElement(iframe);
        resolve();
    });
}

function questionDisplay(progress) {
    document.getElementById("question").innerHTML = '';
    for(i = 0; i < array_question.length; i ++) {
        if(i < token_question_progress) {
            document.getElementById("question").innerHTML += array_question[i];
        //} else if(array_question[i].match(/([,.*+?^=!:${}()|[\]\/\\])/g)) {
        } else if(array_question[i] == ',' || array_question[i] == '.') {
            document.getElementById("question").innerHTML += array_question[i];
        } else {
            for(j = 0; j < array_question[i].length; j++) {
                document.getElementById("question").innerHTML += '*';
            }
        }
        document.getElementById("question").innerHTML += ' '
    }
}

function manageScore(value) {
    getEditURL()
    .then(injectIframe)
    .then(function(iframe) {
        token_user_score += value;
        document.getElementById("score").innerHTML = 'score'+token_user_score;
        //EditUser(iframe, token_user_score);
    })
}

function getEditURL() {
    return new Promise(function (resolve, reject) {
        if(!getEditURL.cache) {
            var a = document.getElementsByClassName("temp")[0].getElementsByTagName("A");
            getEditURL.cache = Array.prototype.reduce.call(a, function(r, e) {
                if(e.href.match('mod/data/edit[.]php[?]d=([0-9]+)[&]amp[;]rid=([0-9]+)')) {
                //if(e.href.match('course/view[.]php[?]id=([0-9]+)')) {
                    r.push(e.href);
                }
                return r;
            }, [])[0];
        }
        resolve(getEditURL.cache);
    });
}

function EditUser(iframe, score) {
    var next_score = token_user_score + score;
    var ary_data = [next_score, token_user_name];
    var doc = iframe.contentDocument;
    var form = Array.prototype.reduce.call(doc.forms, function (r, e) {
        if (("" + e.action).match(/edit.php/)) r.push(e);
        return r;
    }, [])[0];
    for (key in form) {
        if(isNaN(key) == false && form[key].id.match(/field_/)) {
            form[form[key].id].value = ary_data.pop();
        }
    }
    return new Promise(function (resolve, reject) {
        iframe.onload = function (e) {
            resolve(iframe);
        }
        setTimeout(function () {
            //reject("submitNewdiscussion: timeout: over " + injectIframe.timeout + "ms: " + + iframe.src + ": " + form.action);
        }, injectIframe.timeout);
        form.submit();
   });
}

//-------- èàóù --------//
// ÉfÅ[É^ÇÃçÌèú
// getCourseURL()
// .then(function(url) {
//    token_url = url;
//    return GetURL(token_url, 'DB_USER', 'view');
// }).then(injectIframe)
// .then(function(iframe) {
//    DeleteWaitUser(iframe, 1);
// });

// ÉÜÅ[ÉUèÓïÒÇÃéÊìæÅië∂ç›ÇµÇ»Ç¢èÍçáÇ…ÇÕí«â¡Åj
// ÉRÅ[ÉXÇÃURLÇéÊìæ
getCourseURL()
.then(function(url) {
   token_url = url;
   // é©êgÇÃäwèKé“èÓïÒÇéÊìæ
   return GetURL(token_url, 'DB_USER', 'view');
}).then(injectIframe)
.then(ChangeSort)
.then(function() {
    return GetURL(token_url, 'DB_USER', 'view');
}).then(injectIframe)
.then(function(iframe) {
    GetName(iframe)
    .then(function(name) {
        token_user_name = name;
        console.log(name);
    })
    .then(function() {
        return GetUserData(iframe, token_user_name);
    })
    .then(function(mydata) {
        if(mydata['name'] == undefined || mydata['score'] == undefined) {
            // é©êgÇÃäwèKé“èÓïÒÇ™ìoò^Ç≥ÇÍÇƒÇ¢Ç»Ç©Ç¡ÇΩèÍçá
            token_user_score = 1500;
            // ÉfÅ[É^ÇÃìoò^
            GetURL(token_url, 'DB_USER', 'edit')
            .then(injectIframe)
            .then(function(iframe2) {
                RegistUserData(iframe2, token_user_name, token_user_score);
            });
        } else {
            // ìoò^Ç≥ÇÍÇƒÇ¢ÇΩèÍçá
            token_user_score = mydata['score'];
        }
        // âÊñ ï\é¶
        document.getElementById("name").innerHTML = token_user_name;
        document.getElementById("score").innerHTML = 'score'+token_user_score;
    });
////////// ë“ã@äwèKé“DBÇ…ìoò^ //////////
})
// äwèKèÓïÒÇéÊìæ
.then(function() {
    return GetURL(token_url, 'DB_INFO', 'view');
})
.then(injectIframe)
.then(ChangeSort)
.then(function() {
    return GetURL(token_url, 'DB_INFO', 'view');
}).then(injectIframe)
.then(GetStudyInfo)
.then(function(info) {
    token_ID = info['ID'];
    token_question_ID = info['Question'];
})
.then(function() {
   return GetURL(token_url, 'DB_REGIST', 'edit');
})
.then(injectIframe)
.then(function(iframe) {
   RegistWaitUserData(iframe, token_user_name, token_user_score, token_ID);
})
.then(function() {
   loopStart = 0;
   var new_id = 0;
   setTimeout(function loop() {
        console.time('timer1');
        GetURL(token_url, 'DB_INFO', 'view')
        .then(injectIframe)
        .then(GetStudyInfo)
        .then(function(info) {
            //console.log(info['ID']+'vs'+token_ID);
            if(info['ID'] != token_ID) {
                phase = 1;
            }
        })
        // .then(function() {
        //     return GetURL(token_url, 'DB_REGIST', 'view');
        // })
        // .then(injectIframe)
        // .then(function(iframe) {
        //     console.log("loop check:"+loopStart);
        //     CountWaitUser(iframe, token_ID)
        //     .then(function(count) {
        //         document.getElementById("message").innerHTML = count;
        //     });
        // })
        .then(function() {
            //console.log('phase:'+var_phase);
           if(phase != 0) {
                document.getElementById("message").innerHTML = 'Loading...';
                learningP2();
            } else if(loopStart < loopLimit) {
                loopStart += loopCount;
                setTimeout(loop, loopInterval);  
            } else {
                document.getElementById("message").innerHTML = 'Time out.';
            }
        });
        console.timeEnd('timer1')
    }, 0, undefined);
});

function learningP2() {
    GetURL(token_url, 'sound'+token_question_ID)
    .then(injectIframe)
    .then(function(data) {
        document.getElementById("sound").innerHTML = "<audio id='sentence' controls='controls' preload='auto'>can't play...<source src='"+data.src+"' type='audio/mp3'>";
    }).then(function() {
        return GetURL(token_url, 'DB_QUESTION', 'view');
    }).then(injectIframe)
    .then(ChangeSort)
    .then(function() {
        return GetURL(token_url, 'DB_QUESTION', 'view');
    }).then(injectIframe)
    .then(function(iframe) {
        getQuestionDetail(iframe, token_question_ID);
    }).then(function() {
        console.log('get question');
        document.getElementById("source").innerHTML = token_question_source;
        document.getElementById("translation").innerHTML = token_question_translation;
        questionDisplay(token_question_progress);
    }).then(function() {
        loopStart = 0;
        GetURL(token_url, 'DB_ROOM', 'view')
        .then(injectIframe)
        .then(ChangeSort)
        .then(function() {
            setTimeout(function loop() {
                GetURL(token_url, 'DB_ROOM', 'view')
                .then(injectIframe)
                .then(function(iframe) {
                    GetRoomData(iframe, token_ID, token_user_name);
                }).then(function() {
                    if(token_myorder != -1 && token_partner != '') {
                        document.getElementById("partner").innerHTML = "Partner:"+token_partner;
                        phase = 2;
                    }
                }).then(function() {
                    if(phase > 1) {
                        document.getElementById("message").innerHTML = 'Waiting...';
                        learningP3();
                    } else if(loopStart < loopLimit) {
                        loopStart += loopCount;
                        setTimeout(loop, loopInterval);  
                    } else {
                        document.getElementById("message").innerHTML = 'Time out.';
                    }
                });
            }, 0, undefined);
        });
    });
}

function learningP3() {
    GetURL(token_url, 'DB_SYNC', 'edit')
    .then(injectIframe)
    .then(function(iframe) {
        RegistSyncData(iframe, token_ID, token_user_name);
    })
    .then(function() {
        return GetURL(token_url, 'DB_SYNC', 'view');
    })
    .then(injectIframe)
    .then(ChangeSort)
    .then(function() {
        loopStart = 0;
        setTimeout(function loop() {
            GetURL(token_url, 'DB_SYNC', 'view')
            .then(injectIframe)
            .then(function(iframe) {
                return GetSyncData(iframe, token_ID, token_partner);
            })
            .then(function(result) {
                console.log(result);
                if(result == 'true') {
                    phase = 3;
                }
            })
            .then(function() {
                if(phase > 2) {
                    document.getElementById("message").innerHTML = 'Start!';
                    console.log('order:'+token_myorder);
                    if(token_myorder == 0) {
                        document.getElementById("btn_send").disabled = false;
                    } else if(token_myorder == 1) {
                        study_wait();
                    }
                } else if(loopStart < loopLimit) {
                    loopStart += loopCount;
                    setTimeout(loop, loopInterval);  
                } else {
                    document.getElementById("message").innerHTML = 'Time out.';
                }
            })
        }, 0, undefined);
    });
}

function study_wait() {
    loopStart = 0;
    GetURL(token_url, 'DB_ANSWER', 'view')
    .then(injectIframe)
    .then(ChangeSort)
    .then(function() {
        setTimeout(function loop() {
            console.time('timer1');
            GetURL(token_url, 'DB_ANSWER', 'view')
            .then(injectIframe)
            .then(function(iframe) {
                return GetAnswer(iframe, token_ID, token_order);
            })
            .then(function(result) {
                console.log(result);
                if(result != '') {
                    token_order ++;
                    document.getElementById("message").innerHTML = 'Get sentence:'+result;
                    document.getElementById("btn_send").disabled = false;
                    AnswerCheck(result, 0);
                    questionDisplay(token_question_progress);
                } else if(loopStart < loopLimit){
                    loopStart += loopCount;
                    setTimeout(loop, loopInterval);
                } else {
                    document.getElementById("message").innerHTML = 'Time out.';
                }
            })
            console.timeEnd('timer1');
        }, 0, undefined);
    });
}

function btnEvent(inputData) {

    if(inputData == '') {
        document.getElementById("message").innerHTML = 'EMPTY';
    } else {
        token_order ++;
        document.getElementById("message").innerHTML = 'Sended sentence:'+inputData;
        document.getElementById("answerbox").value = ""
        GetURL(token_url, 'DB_ANSWER', 'edit')
        .then(injectIframe)
        .then(function(iframe) {
            RegistAnswer(iframe, inputData, token_ID, token_user_name, token_order);
        });
    }
    document.getElementById("btn_send").disabled = true;
    AnswerCheck(inputData, 1);
    questionDisplay(token_question_progress);
    if(token_question_progress < array_question.length) {
        study_wait();
    }
}

function AnswerCheck(answer, order) {
    if(answer == array_question[token_question_progress]) {
        console.log("o");
        token_question_progress ++;
        if(array_question[token_question_progress] == ',' || array_question[token_question_progress] == '.') {
            token_question_progress ++;
        }
        if(order == 1) {
            manageScore(5);
        }
    } else {
        console.log("x");
        if(order == 1) {
            manageScore(-5)
        }
    }
    console.log(token_question_progress);
}

// âπê∫ÉtÉ@ÉCÉãÇÃì«Ç›çûÇ›
// getCourseURL().then(function(url) {
//    return GetURL(url, 'sound2')
// }).then(injectIframe)
// .then(function(data) {
//    document.getElementById("message").innerHTML = "<audio id='sentence' controls='controls' preload='auto'>can't play...<source src='"+data.src+"' type='audio/mp3'>";
// });

</script>