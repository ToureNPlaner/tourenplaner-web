window.templates = window.templates || {};

templates.topbarView = '<div class="fill">\
                            <div class="container">\
                              <h3><a href="#">ToureNPlaner</a></h3>\
                              <ul class="nav secondary-nav private-server">\
                                <li class="login-link"><a href="#/login">' + $._('Login') + '</a></li>\
                                <li class="register-link"><a href="#/register">' + $._('Register') + '</a></li>\
                                <li class="user"><a href="#" onclick="return false;"></a></li>\
                                <li class="menu">\
                                  <a class="menu" href="#">' + $._('Settings') + '</a>\
                                  <ul class="menu-dropdown">\
                                    <li><a href="#/settings">' + $._('Usersettings') + '</a></li>\
                                    <li class="admin"><a href="#/admin">' + $._('Administration') + '</a></li>\
                                    <li><a href="#/billing">' + $._('Billing') + '</a></li>\
                                    <li class="divider"></li>\
                                    <li><a href="#/logout">' + $._('Logout') + '</a></li>\
                                  </ul>\
                                </li>\
                              </ul>\
                            </div>\
                        </div>';

templates.sidebarView = '<div style="padding: 5px 0px;">\
                            <form name="route">\
                              <div class="container">\
                                <h3>' + $._('Algorithms') + ':</h3>\
                                <select name="algorithms" id="algorithms">\
                                  <option value="">' + $._('No algorithms') + '</option>\
                                </select>\
                              </div>\
                              <div style="border-bottom: 1px solid #CCC; padding: 5px 0;"></div>\
                              <div class="container">\
                                <h3>' + $._('Points') + ':</h3>\
                                <div id="marks">' + $._('No points defined!') + '</div>\
                              </div>\
                              <div class="container">\
                                <a href="#" id="btnSend" class="btn primary">' + $._('Calculate Route') + '</a>\
                                <a href="#" id="btnClear" class="btn secondary">' + $._('Clear') + '</a>\
                              </div>\
                            </form>\
                         </div>';

templates.dataView = '<span class="minmax">\
                        <a href="#">_</a>\
                      </span>\
                      <div class="content" id="dataview">\
                        <p style="padding: 5px 10px">' + $._('No point selected!') + '</p>\
                      </div>';

templates.dataViewContent = '<div class="clearfix"><label for="lon"><b>' + $._('Lon') + ':</b></label><input size="10" value="<%=lonlat.lon%>" type="text" name="lon" id="lon" disabled="disabled" /></div>\
                             <div class="clearfix"><label for="lat"><b>' + $._('Lat') + ':</b></label><input size="10" value="<%=lonlat.lat%>" type="text" name="lat" id="lat" disabled="disabled" /></div>\
                             <div class="clearfix"><label for="markerName"><b>' + $._('Name') + ':</b></label><input value="<%=marker.get("name")%>" type="text" name="markerName" id="markerName" /></div>\
                             <div class="clearfix"><label for="markerPos"><b>' + $._('Position') + ':</b></label><input value="<%=marker.get("position")%>" type="text" name="markerPos" id="markerPos" /></div></div>\
                             Constraints\
                             <%=constraintsHtml%>\
                             <div class="clearfix"><label for="saveMarkAttributes" /><button id="saveMarkAttributes" class="btn primary">' + $._('Apply') + '</button><button id="deleteMark" class="btn secondary">' + $._('Delete') + '</button></div>';

templates.loginView = '<div class="modal-header">\
                        <a href="#" class="close">x</a>\
                        <h3>' + $._('Login') + '</h3>\
                       </div>\
                       <div class="modal-body">\
                        <div class="alert-message error error-empty">\
                          <p><strong>' + $._('Error!') + '</strong> ' + $._('Please fill out all fields.') + '</p>\
                        </div>\
                        <div class="alert-message error error-correct">\
                          <p><strong>' + $._('Error!') + '</strong> ' + $._('The email or password you entered was incorrect.') + '</p>\
                        </div>\
                        <form name="login" method="post" action="#/login">\
                          <div class="clearfix">\
                            <label for="email">' + $._('Email') + ':</label>\
                            <div class="input">\
                              <input type="text" name="email" id="email" />\
                            </div>\
                          </div>\
                          <div class="clearfix">\
                            <label for="password">' + $._('Password') + ':</label>\
                            <div class="input">\
                              <input type="password" name="password" id="password" />\
                            </div>\
                          </div>\
                        </form>\
                       </div>\
                       <div class="modal-footer">\
                        <a href="#" class="btn secondary cancel">' + $._('Cancel') + '</a>\
                        <a href="#/login" class="btn primary login">' + $._('Login') + '</a>\
                       </div>';

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
                                
                                
templates.adminView =  '<div class="modal-header">\
                            <a href="#" class="close">x</a>\
                            <h3 class="title">' + $._('Administration') + '</h3>\
                        </div>\
                        <div class="modal-body">\
                            <%=content%>\
                        </div>\
                        <div class="modal-footer">\
                            <a href="#" class="btn secondary cancel">' + $._('Close') + '</a>\
                        </div>';

templates.adminMainView =  '<a href="#/admin/users">' + $._('Users') + '</a><br />\
                            <a href="#/admin/requests">' + $._('Requests') + '</a><br />';

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
