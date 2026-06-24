jq(function(){
	var imgOuter = jq('.copicwrap');
	var imgDiv = jq('.copic');
	var timeId = null;
	var imgDivs = jq('.copicwrap').children().length;
	var imgNow = 0;
	var imgMouse = 0;
	var imgOuterWidth = imgOuter.width();
	var imgdivWidth = imgDiv.width();
	var edgeDistance = (imgOuterWidth - imgdivWidth) / (imgDivs-1);
	for (var i=1;i<=imgDivs;i++){
		if (i==1){jq('.onpic'+i).css('left',0);}
		else if(i==2){jq('.onpic'+i).css('left',imgdivWidth)}
		else{jq('.onpic'+i).css('left',(i-2)*edgeDistance+imgdivWidth)}
		jq('.onpic'+i).css('z-index',i)
	}

	function autoSlide(){
		if(imgNow == imgDiv.size()-1){
			imgNow = 0;
		}else{
			imgNow ++;
		}

		if(imgNow == 0){
			for(var i=imgDiv.size()-1;i>0;i--){
				imgDiv.eq(i).animate({'left':imgOuterWidth-(imgDiv.size()-i)*edgeDistance+'px'},{easing: 'easeInOutCirc',duration: 500});
			}
		}else{
			imgDiv.eq(imgNow).animate({'left':edgeDistance*imgNow+'px'},{easing: 'easeInOutCirc',duration: 500});
		}
		imgDiv.eq(imgNow).addClass('cur').siblings().removeClass("cur");
	}

	function mouseSlide(){
		if(imgMouse > imgNow){
			for(var i= imgNow+1;i<=imgMouse;i++){
				imgDiv.eq(i).stop().animate({'left':edgeDistance*i+'px'},{easing: 'easeInOutCirc',duration: 500});
			}
			imgNow = imgMouse;
		}else{
			for(var i= imgNow;i>imgMouse;i--){
				imgDiv.eq(i).stop().animate({'left':imgOuterWidth-(imgDiv.size()-i)*edgeDistance+'px'},{easing: 'easeInOutCirc',duration: 500});
			}
			imgNow = imgMouse;
		}
		imgDiv.eq(imgNow).addClass('cur').siblings().removeClass("cur");
	}
	timeId = setInterval(autoSlide,5000);
	imgDiv.hover(function(){
		clearInterval(timeId);
		imgMouse = jq(this).index();
		if(imgMouse != imgNow){
			mouseSlide();
		}
	},function(){
		timeId = setInterval(autoSlide,5000);
	}).bind('click',function(){
		imgNow = jq(this).index();
	});
});
