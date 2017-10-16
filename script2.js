$(function(){

// �z���`
  var messages = [];	// ���b�Z�[�W�i�[
  var peer_id, name, conn;	// �s�AID�A�����̖��O�A�ڑ�
  // �`���b�g�\���̃e���v���[�g�ihandlerbars�j
  var messages_template = Handlebars.compile($('#messages-template').html());

// �V�KPeerJS�C���X�^���X
  var peer = new Peer({
  	// API�L�[
    key: '3cbz326wgxlgnwmi',
    //�f�o�b�O���[�h�̏璷��
    debug: 3,
    // ICE�T�[�o
    config: {'iceServers': [
    { url: 'stun:stun1.l.google.com:19302' },
    { url: 'turn:numb.viagenie.ca',
      credential: 'muazkh', username: 'webrtc@live.com' }
    ]}
  });

  // �C���X�^���X�쐬�ɐ�������Ǝ��s�����
  peer.on('open', function(){
  	// html��id=id�Ƀs�AID���\�������
    $('#id').text(peer.id);
  });

  // �g�p�u���E�U��Ԃ�
  navigator.getUserMedia = navigator.getUserMedia || 
  						   navigator.webkitGetUserMedia || 
  						   navigator.mozGetUserMedia;

  // �r�f�I�֌W�̊֐�
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

  // HTML�̃{�^��Login���N���b�N�����Ƃ��̓���
  $('#login').click(function(){
    // HTML�œ��͂��ꂽuser_name��peer_id�̒l��ϐ��Ɋi�[
    name = $('#user_name').val();
    peer_id = $('#peer_id').val();
    // peer_id�����͂���Ă���Ύ��s
    if(peer_id){
      // ���͂���peer_id�̑����P2P�ڑ�
      conn = peer.connect(peer_id, {metadata: {
         // �ϐ��i���O�j�����^�f�[�^�Ƃ��đ��M
        'username': name
      }});
      // ���b�Z�[�W�����M�����ƁA�֐�data�����s�����
      conn.on('data', handleMessage);
    }
    // HTML�̃^�Ochat��\���A�^�Oconnect���\���ɂ���
    $('#chat').removeClass('hidden');
    $('#connect').addClass('hidden');
  });

  // peer.connect�Őڑ����ꂽ���[�U�̃u���E�U��Ŏ��s�����
  peer.on('connection', function(connection){
    // ���M���ꂽPeer�ڑ��̒��g�����̂܂܊i�[
    conn = connection;
    peer_id = connection.peer;
    // ���b�Z�[�W�����M�����ƁA�֐�data�����s�����
    conn.on('data', handleMessage);

    // HTML�̃^�Opeer_id���\��
    $('#peer_id').addClass('hidden').val(peer_id);
    // connected_peer_container��\��
    $('#connected_peer_container').removeClass('hidden');
    // connected_peer�Ƀ��^�f�[�^�i�ڑ����Ă�������̖��O�j��\��
    $('#connected_peer').text(connection.metadata.username);
  });

  // ���b�Z�[�W�̎�M
  function handleMessage(data){
    // �w�b�_�[�A�t�b�^�[�̃T�C�Y���w��
    var header_plus_footer_height = 285;
    // �`���b�g���e��\�����闓�̒������w��
    var base_height = $(document).height() - header_plus_footer_height;
    // HTML�̃^�Omessage-container�̒������擾
    var messages_container_height = $('#messages-container').height();
    // ��M�����f�[�^��z��messages�Ɋi�[
    messages.push(data);

	// HTML��ŕ\�����邽�߃e���v���[�g�ɓ��͓��e���i�[
    var html = messages_template({'messages' : messages});
    // HTML�^�Omessages�ɕ\��
    $('#messages').html(html);

    // message-container�̒������K��𒴂���
    if(messages_container_height >= base_height){
      // �y�[�W�g�b�v�ֈړ�
      $('html, body').animate({ scrollTop: $(document).height() }, 500);
    }
  }

  // ���b�Z�[�W�̑��M
  function sendMessage(){
    // HTML��id=sendmessage�{�^�����N���b�N����Ǝ��s
    var text = $('#message').val();
    // ���͕�����name�Atext���擾
    var data = {'from': name, 'text': text};

    // �ڑ�conn���g���đ��M
    conn.send(data);
    // ���b�Z�[�W���󂯎��\������֐�
    handleMessage(data);
    // ���͕�����text��������
    $('#message').val('');
  }

  // ���b�Z�[�W�̑��M�̓L�[�R�[�h13�i�G���^�[�L�[�j����͂��邱�ƂŎ��s�����
  $('#message').keypress(function(e){
    if(e.which == 13){
      sendMessage();
    }
  });
  // HTML�̃{�^��send-message���N���b�N���邱�Ƃł����s�����
  $('#send-message').click(sendMessage);

  // �R�[��
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