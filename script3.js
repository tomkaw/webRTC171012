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
    // 同様にタグgreetを表示
    $('#greet').removeClass('hidden');
    // greeted_nameに自信が入力した名前を表示
    $('#greeted_name').text(name);
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
    // チャット内容を表示する欄のピクセル数を取得
    var base_height = $(document).height() - header_plus_footer_height;
    // HTMLのタグmessage-containerのピクセル数を取得
    var messages_container_height = $('#messages-container').height();
    // 受信したデータを配列messagesに格納
    messages.push(data);

	// HTML上で表示するためテンプレートに入力内容を格納
    var html = messages_template({'messages' : messages});
    // HTMLタグmessagesに表示
    $('#messages').html(html);

    // message-containerの長さが規定を超える ＝ 一番下に表示されているチャット入力欄がフレームアウト
    if(messages_container_height >= base_height){
      // ページの縦幅の値（ページの一番下）まで500msかけてスクロール
      $('html, body').animate({ scrollTop: $(document).height() }, 500);
    }
  }

  // メッセージの送信
  function sendMessage(){
    // HTMLのid=sendmessageボタンをクリックすると実行
    var text = $('#message').val();
    // 入力文字列name、textを取得
    var data = {'from': name, 'text': text};

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

});