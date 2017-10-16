$(function(){

// 配列定義
  var messages = [];	// メッセージ格納
  var peer_id, name, conn;	// ピアID、自分の名前、接続
  // チャット表示のテンプレート（handlerbars）
  var messages_template = Handlebars.compile($('#messages-template').html());

// 新規PeerJSインスタンス
  var peer = new Peer({
  	// APIキー
    key: '3cbz326wgxlgnwmi',
    //デバッグモードの冗長性
    debug: 3,
    // ICEサーバ
    config: {'iceServers': [
    { url: 'stun:stun1.l.google.com:19302' },
    { url: 'turn:numb.viagenie.ca',
      credential: 'muazkh', username: 'webrtc@live.com' }
    ]}
  });

  // インスタンス作成に成功すると実行される
  peer.on('open', function(){
  	// htmlのid=idにピアIDが表示される
    $('#id').text(peer.id);
  });

  // 使用ブラウザを返す
  navigator.getUserMedia = navigator.getUserMedia || 
  						   navigator.webkitGetUserMedia || 
  						   navigator.mozGetUserMedia;

  // ビデオ関係の関数
  //function getVideo(callback){
  //  navigator.mediaDevices.getUserMedia({audio: true, video: true}, callback, function(error){
  //    console.log(error);
  //    alert('An error occured. Please try again');
  //  });
  //}

  //getVideo(function(stream){
  //  window.localStream = stream;
  //  onReceiveStream(stream, 'my-camera');
  //});

  //function onReceiveStream(stream, element_id){
  //  var video = $('#' + element_id + ' video')[0];
  //  video.src = window.URL.createObjectURL(stream);
  //  window.peer_stream = stream;
  //}

  // HTMLのボタンLoginをクリックしたときの動作
  $('#login').click(function(){
    // HTMLで入力されたuser_nameとpeer_idの値を変数に格納
    name = $('#user_name').val();
    peer_id = $('#peer_id').val();
    // peer_idが入力されていれば実行
    if(peer_id){
      // 入力したpeer_idの相手にP2P接続
      conn = peer.connect(peer_id, {metadata: {
         // 変数（名前）をメタデータとして送信
        'username': name
      }});
      // メッセージが送信されると、関数dataが実行される
      conn.on('data', handleMessage);
    }
    // HTMLのタグchatを表示、タグconnectを非表示にする
    $('#chat').removeClass('hidden');
    $('#connect').addClass('hidden');
  });

  // peer.connectで接続されたユーザのブラウザ上で実行される
  peer.on('connection', function(connection){
    // 送信されたPeer接続の中身をそのまま格納
    conn = connection;
    peer_id = connection.peer;
    // メッセージが送信されると、関数dataが実行される
    conn.on('data', handleMessage);

    // HTMLのタグpeer_idを非表示
    $('#peer_id').addClass('hidden').val(peer_id);
    // connected_peer_containerを表示
    $('#connected_peer_container').removeClass('hidden');
    // connected_peerにメタデータ（接続してきた相手の名前）を表示
    $('#connected_peer').text(connection.metadata.username);
  });

  // メッセージの受信
  function handleMessage(data){
    // ヘッダー、フッターのサイズを指定
    var header_plus_footer_height = 285;
    // チャット内容を表示する欄の長さを指定
    var base_height = $(document).height() - header_plus_footer_height;
    // HTMLのタグmessage-containerの長さを取得
    var messages_container_height = $('#messages-container').height();
    // 受信したデータを配列messagesに格納
    messages.push(data);

	// HTML上で表示するためテンプレートに入力内容を格納
    var html = messages_template({'messages' : messages});
    // HTMLタグmessagesに表示
    $('#messages').html(html);

    // message-containerの長さが規定を超える
    if(messages_container_height >= base_height){
      // ページトップへ移動
      $('html, body').animate({ scrollTop: $(document).height() }, 500);
    }
  }

  // メッセージの送信
  function sendMessage(){
    // HTMLのid=sendmessageボタンをクリックすると実行
    var text = $('#message').val();
    // 入力文字列name、textを取得
    var data = {'from': user_name, 'text': text};

    // 接続connを使って送信
    conn.send(data);
    // メッセージを受け取り表示する関数
    handleMessage(data);
    // 入力文字列textを初期化
    $('#message').val('');
  }

  // メッセージの送信はキーコード13（エンターキー）を入力することで実行される
  $('#message').keypress(function(e){
    if(e.which == 13){
      sendMessage();
    }
  });
  // HTMLのボタンsend-messageをクリックすることでも実行される
  $('#send-message').click(sendMessage);

  // コール
  //$('#call').click(function(){
  //  console.log('now calling: ' + peer_id);
  //  console.log(peer);
  //  var call = peer.call(peer_id, window.localStream);
  //  call.on('stream', function(stream){
  //    window.peer_stream = stream;
  //    onReceiveStream(stream, 'peer-camera');
  //  });
  //});

  //peer.on('call', function(call){
  //  onReceiveCall(call);
  //});

  //function onReceiveCall(call){
  //  call.answer(window.localStream);
  //  call.on('stream', function(stream){
  //    window.peer_stream = stream;
  //    onReceiveStream(stream, 'peer-camera');
  //  });
  //}
});