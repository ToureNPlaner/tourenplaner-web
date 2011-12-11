window.templates = window.templates || {};

templates.messageView = '<div class="modal-header">\
                            <a href="#" class="close">x</a>\
                            <h3 class="title"><%=title%></h3>\
                         </div>\
                         <div class="modal-body">\
                          <div class="message"><%=message%></div>\
                         </div>\
                         <div class="modal-footer">\
                          <a href="#" class="btn primary cancel">'+$._('Close')+'</a>\
                         </div>';

templates.loadingView = '<div class="body">\
                            <div class="loading"><img src="img/loading.gif" alt="Loading" title="Loading" /></div>\
                            <div class="message"><%=message%></div>\
                         </div>';
