angular.module('MainCtrl', []).controller('MainController', function($scope, $http) {

	$("#qrgenerator").css("display", "block");
    $("#container").css("display", "none");
	$scope.qrCode;
	$scope.isQRGenerated = false;
	$scope.classNames = ['1', '2', '3', '4', '5', '6', '7', '8'];

	//$scope.tagline = 'To the moon and back!';
	$scope.generateQRCode = function(){
        // +++++++++++++++++++++++++++++++++ Validations begin +++++++++++++++++++++++++++++++++//
        var error = "Please enter"
        if(!$scope.className){
            error += " class name";
        }
        if(!$scope.syllabusNo){
            error += " subject name";
        }
        if(!$scope.pageNo){
            error += " page number";
        }
        if(!$scope.description){
            error += " description";
        }
        if(error.length > 12){
            alert(error);
            return;
        }
        console.log(error);
        // +++++++++++++++++++++++++++++++++ Validations ends +++++++++++++++++++++++++++++++++//
        if(!$scope.isQRGenerated == true){
            $scope.imageid;
		    $scope.title = 'Grade' + $scope.className + 'Subject' + $scope.syllabusNo + 'PgNo' + $scope.pageNo;
		    $http({
              method: 'POST',
              url: '/addToDatabase',
              data: {image_title: $scope.title, image_description: $scope.description, image_pgno : $scope.pageNo}
            }).then(function successCallback(response) {
	        console.log("Image saved successfully :: " + JSON.stringify(response.data));
            $scope.imageid = response.data[0].image_id;
            var url = "www.nextcurriculum.in/app/qrcode/" + $scope.imageid;
            console.log("URL::" + url);
            $('#text').val(url);
            $('#label').val($scope.pageNo);
            update();
            $scope.isQRGenerated = true;
	        }, function errorCallback(response) {
	           console.log("Error could not save image::" + JSON.stringify(response));
               if(response.data.data.code == "ER_DUP_ENTRY"){
                    $scope.generalText = "Image not saved. Image with same name is already generated" ; 
               } else {
                    $scope.generalText = "Image not saved";
               }
               
	        });
        } else {
            update();
        }
        $("#container").css("display", "inline-block");
	}

    $scope.createNew = function(){
        if($scope.title){
            alert("Please save image");
            return;
        }
        $scope.isQRGenerated = false;
        $("#container").css("display", "none");
        $scope.className = "";
        $scope.syllabusNo = "";
        $scope.pageNo = "";
        $scope.description = "";
        $scope.generalText = "";
    }
	$scope.download = function(){
        var src;
		$('img.downloadable').each(function(){
			var $this = $(this);
            src = $this[0].src;
			console.log($this[0].src);
		});
        console.log("title of image" + $scope.title);
        $http({
          method: 'POST',
          url: '/saveImage',
          data: {image: src, image_id: $scope.imageid, image_title : $scope.title}
        }).then(function successCallback(response) {
            console.log("Image saved successfully :: " + JSON.stringify(response));
            $scope.title = "";
            $scope.createNew();
            $scope.generalText = "Image saved successfully";
          }, function errorCallback(response) {
            console.log("Error could not save image::" + JSON.stringify(response));
            $scope.generalText = "Image not saved";
          });
	}

	var win = window; // eslint-disable-line no-undef
    var FR = win.FileReader;
    var doc = win.document;
    var kjua = win.kjua;

    var guiValuePairs = [
        ['size', 'px'],
        ['minversion', ''],
        ['quiet', ' modules'],
        ['rounded', '%'],
        ['msize', '%'],
        ['mposx', '%'],
        ['mposy', '%']
    ];

    function elById(id) {
        return doc.getElementById(id);
    }

    function valById(id) {
        var el = elById(id);
        return el && el.value;
    }

    function intById(id) {
        return parseInt(valById(id), 10);
    }

    function onEvent(el, type, fn) {
        el.addEventListener(type, fn);
    }

    function onReady(fn) {
        onEvent(doc, 'DOMContentLoaded', fn);
    }

    function forEach(list, fn) {
        Array.prototype.forEach.call(list, fn);
    }

    function all(query, fn) {
        var els = doc.querySelectorAll(query);
        if (fn) {
            forEach(els, fn);
        }
        return els;
    }

    function updateGui() {
        guiValuePairs.forEach(function (pair) {
            var label = all('label[for="' + pair[0] + '"]')[0];
            var text = label.innerHTML;
            label.innerHTML = text.replace(/:.*$/, ': ' + valById(pair[0]) + pair[1]);
        });
    }

    function updateQrCode() {
        var options = {
            render: valById('render'),
            crisp: valById('crisp') === 'true',
            ecLevel: valById('eclevel'),
            minVersion: intById('minversion'),

            fill: valById('fill'),
            back: valById('back'),

            text: valById('text'),
            size: intById('size'),
            rounded: intById('rounded'),
            quiet: intById('quiet'),

            mode: valById('mode'),

            mSize: intById('msize'),
            mPosX: intById('mposx'),
            mPosY: intById('mposy'),

            label: valById('label'),
            fontname: valById('font'),
            fontcolor: valById('fontcolor'),

            image: elById('img-buffer')
        };

        var container = elById('container');
        var qrcode = kjua(options);
        qrcode.setAttribute("class", "downloadable");
        forEach(container.childNodes, function (child) {
            container.removeChild(child);
        });
        if (qrcode) {
            container.appendChild(qrcode);
        }
        $('img.downloadable').each(function(){
    		var $this = $(this);
    		$this.wrap('<a href="' + $this.attr('src') + '" download />')
	    });
    }

    function update() {
        updateGui();
        updateQrCode();
    }

    function onImageInput() {
        var input = elById('image');
        if (input.files && input.files[0]) {
            var reader = new FR();
            reader.onload = function (ev) {
                elById('img-buffer').setAttribute('src', ev.target.result);
                elById('mode').value = 4;
                setTimeout(update, 250);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    onReady(function () {
        onEvent(elById('image'), 'change', onImageInput);
        all('input, textarea, select', function (el) {
            onEvent(el, 'input', update);
            onEvent(el, 'change', update);
        });
        onEvent(win, 'load', update);
        update();
    });

    var jsdata = [
                    {"Syllabus": "1010853", "Subject": "English", "Class": "Nursery"},
                    {"Syllabus": "1010590", "Subject": "English", "Class": "V"},
                    {"Syllabus": "1010591", "Subject": "English", "Class": "LKG"},
                    {"Syllabus": "1010850", "Subject": "English", "Class": "UKG"},
                    {"Syllabus": "1010849", "Subject": "English", "Class": "II"},
                    {"Syllabus": "1010852", "Subject": "English", "Class": "IV"},
                    {"Syllabus": "1010851", "Subject": "English", "Class": "III"},
                    {"Syllabus": "1010989", "Subject": "English", "Class": "VII"},
                    {"Syllabus": "1010990", "Subject": "English", "Class": "VIII"},
                    {"Syllabus": "1010988", "Subject": "English", "Class": "VI"},
                    {"Syllabus": "1010157", "Subject": "Maths", "Class": "LKG"},
                    {"Syllabus": "1010152", "Subject": "Maths", "Class": "Nursery"},
                    {"Syllabus": "1010162", "Subject": "Maths", "Class": "UKG"},
                    {"Syllabus": "1009416", "Subject": "Maths", "Class": "I"},
                    {"Syllabus": "1012412", "Subject": "Maths", "Class": "VII"},
                    {"Syllabus": "1012411", "Subject": "Maths", "Class": "VI"},
                    {"Syllabus": "1009417", "Subject": "Maths", "Class": "II"},
                    {"Syllabus": "1012413", "Subject": "Maths", "Class": "VIII"},
                    {"Syllabus": "1009418", "Subject": "Maths", "Class": "III"},
                    {"Syllabus": "1009419", "Subject": "Maths", "Class": "IV"},
                    {"Syllabus": "1009420", "Subject": "Maths", "Class": "V"},
                    {"Syllabus": "1012357", "Subject": "Science", "Class": "II"},
                    {"Syllabus": "1012355", "Subject": "Science", "Class": "I"},
                    {"Syllabus": "1010604", "Subject": "Science", "Class": "V"},
                    {"Syllabus": "1010603", "Subject": "Science", "Class": "IV"},
                    {"Syllabus": "1010602", "Subject": "Science", "Class": "III"},
                    {"Syllabus": "1012358", "Subject": "Social Studies", "Class": "II"},
                    {"Syllabus": "1012356", "Subject": "Social Studies", "Class": "I"},
                    {"Syllabus": "1010607", "Subject": "Social Studies", "Class": "V"},
                    {"Syllabus": "1010606", "Subject": "Social Studies", "Class": "IV"},
                    {"Syllabus": "1010605", "Subject": "Social Studies", "Class": "III"},
                    {"Syllabus": "1010600", "Subject": "EVS", "Class": "IV"},
                    {"Syllabus": "1010599", "Subject": "EVS", "Class": "III"},
                    {"Syllabus": "1010598", "Subject": "EVS", "Class": "II"},
                    {"Syllabus": "1010597", "Subject": "EVS", "Class": "I"},
                    {"Syllabus": "1010601", "Subject": "EVS", "Class": "V"},
                    {"Syllabus": "1010843", "Subject": "Hindi", "Class": "V"},
                    {"Syllabus": "1010841", "Subject": "Hindi", "Class": "III"},
                    {"Syllabus": "1010842", "Subject": "Hindi", "Class": "IV"},
                    {"Syllabus": "1010839", "Subject": "Hindi", "Class": "I"},
                    {"Syllabus": "1010840", "Subject": "Hindi", "Class": "II"},
                    {"Syllabus": "1012408", "Subject": "Hindi", "Class": "VI"},
                    {"Syllabus": "1012410", "Subject": "Hindi", "Class": "VIII"},
                    {"Syllabus": "1012409", "Subject": "Hindi", "Class": "VII"},
                    {"Syllabus": "1010869", "Subject": "Hindi", "Class": "UKG"},
                    {"Syllabus": "1010868", "Subject": "Hindi", "Class": "LKG"}
                ];

    $scope.subjects = ["Hindi", "EVS", "Social_Studies", "Science", "Maths", "English"];
});