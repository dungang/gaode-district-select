+function($,AMap){
    $.fn.DISTRICT_DEFAULT = {
      defCenter:[116.480983, 40.0958],
      provincecode:110000, //北京
      citycode:110100, //北京
      districtcode:110101 //北京
    };

    var defTmplet = 
    '<div class="nda-map-panel">'
    +   '<div class="nda-map-tools">'
    +     ' 省：<select name="provincecode" data-root="中国" data-child="citycode"></select>'
    +     ' 市：<select name="citycode" data-child="districtcode"></select>'
    +     ' 区：<select name="districtcode" ></select>'
    +     ' 街道：<input type="text" name="street" value="" />'
    +   '</div>'
    +   '<div class="nda-map" tabindex="0"></div>'
    +   '<div class="nda-map-foot">'
    +       '<button class="nda-map-yes">确定</button>'
    +       '<button class="nda-map-no">取消</button>'
    +   '</div>'
    +'</div>';

    AMap.service('AMap.DistrictSearch',function(){//回调函数
        //实例化DistrictSearch
        var districtSearch = new AMap.DistrictSearch({
          subdistrict : 1  
        });

        
        /**
         * 组合option
         * @param {*} districts 
         * @param {*} adcode 
         */
        function combineOptions(districts,adcode){
          return $.map(districts,function(district){
            if(parseInt(district.adcode) == parseInt(adcode)) {
              return "<option value='"+district.adcode+"' selected >"+district.name+"</option>";
            } else {
              return "<option value='"+district.adcode+"'>"+district.name+"</option>";
            }
          }).join('');
        }

        /**
         * 渲染当前的select的options
         * 跟上级district name 查找子的district
         * @param {*} container 
         * @param {*} selectObj 
         * @param {*} parentDistrictName 
         * @param {*} opts 
         */
        function renderOptions(container,selectObj,parentDistrictName,opts){
          //TODO: 使用districtSearch对象调用行政区查询的功能
          //调用查询方法
          districtSearch.search(parentDistrictName,function(status, result){
            //TODO : 按照自己需求处理查询结果
            if (status=='complete') {
              var name = selectObj[0].name;
              var data = selectObj.data();
              var selectedAdcode = opts[name]||'';
              //渲染自己
              selectObj.html(combineOptions(result.districtList[0].districtList,selectedAdcode));
              var districtName = selectObj.find('option:selected').text();
              if(data.child) {
                //渲染下级select
                renderOptions(container,container.find('select[name='+data.child+']'),districtName,opts);
              }
            }
          })
        }

        /**
         * 根据关键字定位
         * @param {*} container 
         * @param {*} name 
         */
        function locateCenter(container,name){
          districtSearch.search(name,function(status, result){
            if(status == 'complete') {
              var map = container.data('map');
              console.log(result);
              if(map){
                map.setCenter(result.districtList[0].center);
                map.setFitView();
              }
            }
          });
        }

        $.fn.district = function(options){
            var opts = $.extend({},$.fn.DISTRICT_DEFAULT,options);
            return this.each(function(){
              var _this = $(this);

              //渲染地图
              var div = _this.find('.nda-map')[0];
              if(div) {
                var map = new AMap.Map(div,{
                  resizeEnable: true,
                  zoom: 12,
                  zooms:[10,18],
                  center: opts.defCenter
                });
                _this.data('map',map);
              } else {
                console.log('必须定义地图的容器');
              }
              //渲染区域选择
              _this.find('select').each(function(){
                var _select = $(this);
                var data = _select.data();
                if(data.root){
                  renderOptions(_this,_select,data.root,opts)
                }
                
                _select.on('change',function(){
                  var districtName = _select.find('option:selected').text();
                  locateCenter(_this,districtName);
                  if(data.child) {
                    renderOptions(_this,_this.find('select[name='+data.child+']'),districtName,opts);
                  }
                });
              });
              //街道
              _this.find('.nda-map-tools input').keydown(function(e){
                if(e.keycode==13){
                  locateCenter(_this,$(this).val());
                }
              });
              //确认按钮
              _this.find('.nda-map-yes').click(function(e){
                e.preventDefault();
                //处理业务逻辑,请完成


              });
              //取消按钮
              _this.find('.nda-map-no').click(function(e){
                e.preventDefault();
                //处理业务逻辑
                _this.remove();
              });
            });
        };

        //绑定触发按钮
        $(document).on('click','.nda-district-select-button',function(e){
            e.preventDefault();
            $('body').append(defTmplet);
            var config = $(this).data();
            $('.nda-map-panel').district(config);
        });
    });
}(jQuery,AMap);