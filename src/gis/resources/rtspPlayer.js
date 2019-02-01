define(['../../assets/js/rtspVideoBundle'], 
function(modules){
	var _config = modules[3].exports;
	var wsUrl = window.linc.config.wsRtspUrl;
	_config.RTSP_CONFIG['websocket.url'] = wsUrl;
	
	var PLAYERS = {};
	//自动清缓存,5秒一次
	setInterval(function(){
		_.forEach(PLAYERS, function(player){
			var el = $(player.player);
			var mse = player.client.mse;
			if(mse.sourceBuffer && el.data("playing")){	// && mse.sourceBuffer.buffered
				console.log("=== cleanup ===");
				mse.doCleanup();
				//player.client.remuxer.flush();
			}
			/*
			if(el.data("playing") === false){
				console.log("=== set stream ===");
				//player.setStream(player.url);
				//player.client.reconnect();
			}
			*/
		});
	}, 5000);
	
	var palyer = {
		play : function(players){
			var rtsp = modules[0].exports.rtsp;
			
			players = players || $(".rtspVideo");
			if(players == null || players.length == 0) return;

			for(var i = 0; i < players.length; i++){
				var player = rtsp.attach(players[i]);
				if (!player.started()) {
					player.start();
				}
				
				//console.log(player);
				var el = $(players[i]);
				PLAYERS[el.attr('id')] = player;
				el.removeClass("rtspVideo");
			}
		},
		stop : function(id){
			if(PLAYERS[id]){
				PLAYERS[id].stop();
				delete PLAYERS[id];
			}
		},
		restart : function(id){
			var player = PLAYERS[id];
			if(!player){
				return;
			}
			//player.stop();
			
			var url = player.url;
			player.setStream(url);
			
			
			
			//player.client.reconnect();
			//player.connection.reconnect();
			
			/*
			console.log(this);
			this.stop(player.id);
			this.play($(player.player));
			*/
		}
	}
	return palyer;
});