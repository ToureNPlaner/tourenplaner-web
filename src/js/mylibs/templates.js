window.templates = window.templates || {};

templates.registerView = '  <div class="modal-header">\
                              <a href="#" class="close">x</a>\
                              <h3>' + $._('Registration') + '</h3>\
                            </div>\
                            <div class="modal-body">\
                              <div class="alert-message error error-empty">\
                                <p><strong>' + $._('Error!') + '</strong> ' + $._('Please fill out all fields.') + '</p>\
                              </div>\
                              <div class="alert-message error error-correct">\
                                <p><strong>' + $._('Error!') + '</strong> ' + $._('There were errors in the form.') + '</p>\
                              </div>\
                              <form name="register" method="post" action="#/register">\
                                <div class="clearfix">\
                                  <label for="firstname">' + $._('First name') + ': </label>\
                                  <div class="input">\
                                    <input type="text" name="firstname" id="firstname" />\
                                  </div>\
                                </div>\
                                <div class="clearfix">\
                                  <label for="lastname">' + $._('Last name') + ': </label>\
                                  <div class="input">\
                                    <input type="text" name="lastname" id="lastname" />\
                                  </div>\
                                </div>\
                                <div class="clearfix">\
                                  <label for="address">' + $._('Address') + ': </label>\
                                  <div class="input">\
                                    <textarea name="address" id="address"></textarea>\
                                  </div>\
                                </div>\
                                <div class="clearfix">\
                                  <label for="email">' + $._('Email') + ': </label>\
                                  <div class="input">\
                                    <input type="text" name="email" id="email" />\
                                  </div>\
                                </div>\
                                <div class="clearfix">\
                                  <label for="password">' + $._('Password') + ': </label>\
                                  <div class="input">\
                                    <input type="password" name="password" id="password" />\
                                  </div>\
                                </div>\
                                <div class="clearfix">\
                                  <label for="repeat_password">' + $._('Repeat Password') + ': </label>\
                                  <div class="input">\
                                    <input type="password" name="repeat_password" id="repeat_password" />\
                                  </div>\
                                </div>\
                              </form>\
                            </div>\
                            <div class="modal-footer">\
                              <a href="#" class="btn secondary cancel">' + $._('Cancel') + '</a>\
                              <a href="#/register" class="btn primary register">' + $._('Register') + '</a>\
                            </div>';

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
