Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    if (_.isEqual(arg1, arg2))
        return options.fn(this);
    else
        return options.inverse(this);
});

Handlebars.registerHelper('toKm', function(distance) {
    return distance/1000;
});

window.templates = window.templates || {};

templates.topbarView = '<div class="navbar navbar-inverse navbar-static-top">\
                          <div class="navbar-inner">\
                            <div class="container-fluid">\
                              <div class="pull-left">\
                                <a class="brand" href="#">ToureNPlaner</a>\
                                <img src="img/icon.png" class="icon">\
                                <form class="pull-left navbar-search">\
                                  <input type="search" class="search-query" placeholder="' + $._('Search') + '" />\
                                </form>\
                              </div>\
                              <div class="pull-right nav-collapse">\
                                <ul class="nav private-server">\
                                  <li class="user"><a href="#" onclick="return false;"></a></li>\
                                  <li class="dropdown">\
                                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">' + $._('Settings') + ' <b class="caret"></b></a>\
                                    <ul class="dropdown-menu">\
                                      <li><a href="#settings">' + $._('Profile') + '</a></li>\
                                      <li><a href="#billing">' + $._('Billing') + '</a></li>\
                                      <li><a href="#import">' + $._('Im-/Export') + '</a></li>\
                                      <li class="admin"><a href="#admin">' + $._('Administration') + '</a></li>\
                                      <li class="divider"></li>\
                                      <li><a href="#logout">' + $._('Logout') + '</a></li>\
                                    </ul>\
                                  </li>\
                                </ul>\
                                <ul class="nav"><li><a href="#about">' + $._('About') + '</a></li></ul>\
                              </div>\
                            </div>\
                          </div>\
                        </div>';

templates.sidebarView = '<div style="padding: 5px 0px;">\
                            <form name="route">\
                              <div class="container">\
                                <h4>' + $._('Selected Algorithm') + ':</h4>\
                                <a href="#" id="selectedAlg" class="showAlgs">' + $._('No algorithms') + ' </a>\
                              </div>\
                              <div style="border-bottom: 1px solid #CCC; padding: 5px 0;"></div>\
                              <div class="container">\
                                <h4>' + $._('Points') + ': <a href="#" class="btn btn-small flip"><img src="img/arrow-switch.png" alt="' + $._('Switch order') + '" title="' + $._('Switch order') + '" /></a></h4>\
                                <div id="marks">' + $._('No points defined!') + '</div>\
                              </div>\
                              <div class="container">\
                                <a href="#" class="btn btn-primary send">' + $._('Calculate Route') + '</a>\
                                <a href="#" class="btn clear">' + $._('Clear') + '</a>\
                              </div>\
                            </form>\
                         </div>';
templates.sidebarView = Handlebars.compile(templates.sidebarView);


templates.dataView = '<span class="minmax">\
                        <a href="#">_</a>\
                      </span>\
                      <div class="content" id="dataview">\
                        <p style="padding: 5px 10px">' + $._('No point selected!') + '</p>\
                      </div>';

templates.dataViewContent = '<table border="0" class="grid">\
                                <tr><td><b>' + $._('Name') + '</b>:</td><td><input value="{{marker.name}}" type="text" name="markerName" id="markerName" /></td></tr>\
                                <tr><td><b>' + $._('Lon') + '</b>:</td><td><input value="{{lonlat.lng}}" type="text" name="lon" id="lon" disabled="disabled"/></td></tr>\
                                <tr><td><b>' + $._('Lat') + '</b>:</td><td><input value="{{lonlat.lat}}" type="text" name="lat" id="lat" disabled="disabled"/></td></tr>\
                               {{#if constraints}}\
                                  {{#each constraints}}\
                                    <tr><td><b>{{name}}:</b></td><td>\
                                      {{#ifEquals type "boolean"}}\
                                        <input type="checkbox" title="{{description}}" name="pc_{{id}}" id="pc_{{id}}" />\
                                      {{else}}\
                                        {{#ifEquals type "enum"}}\
                                          <select class="textbox-dataview" name="pc_{{id}}" id="pc_{{id}}" title="{{description}}"></select>\
                                        {{else}}\
                                          <input type="text" class="textbox-dataview" title="{{description}}" name="pc_{{id}}" id="pc_{{id}}" /> {{#ifEquals type "meter"}}m{{/ifEquals}}{{#ifEquals type "price"}}&euro;{{/ifEquals}}\
                                          {{/ifEquals}}\
                                      {{/ifEquals}}\
                                    </td></tr>\
                                  {{/each}}\
                               {{/if}}\
                             </table>\
                             <div class="clearfix"><label for="saveMarkAttributes" /><button id="saveMarkAttributes" class="btn primary disabled">' + $._('Apply') + '</button><button id="deleteMark" class="btn secondary">' + $._('Delete') + '</button></div>';

templates.dataViewContent = Handlebars.compile(templates.dataViewContent);

templates.routeOverlay = '<div class="header">' + $._('Routeinfos') + '</div>';
templates.routeOverlay = Handlebars.compile(templates.routeOverlay);

templates.routeOverlayAttribute = '<div style="float: left"><div class="info"><b>{{name}}</b>: {{value}}</div>';
templates.routeOverlayAttribute = Handlebars.compile(templates.routeOverlayAttribute);

templates.algView =  '<h4>' + $._('Algorithms') + ':<a href="#" class="close">x</a></h4>\
                      <form>\
                        <div id="algorithms" class="clearfix">\
                          {{#each algorithms}}\
                            {{#unless this.details.hidden}}\
                              <div class="clearfix">\
                                <label class="radio">\
                                  <input type="radio" name="alg" id="{{urlsuffix}}" value="{{urlsuffix}}" {{#ifEquals ../../currentAlg.urlsuffix urlsuffix}}checked="checked"{{/ifEquals}} />\
                                    {{name}}\
                                </label>\
                                <div class="algdescription">{{description}}</div>\
                              </div>\
                            {{/unless}}\
                          {{/each}}\
                        </div>\
                        <div id="constraints">\
                          {{#if currentAlg.constraints}}\
                            <div class="bar">&nbsp;</div>\
                            <h4>' + $._('Constraints') + ':</h4>\
                            {{#each currentAlg.constraints}}\
                              <div class="clearfix">\
                                <label for="pc_{{name}}">{{name}}: </label>\
                                {{#ifEquals type "boolean"}}\
                                  <input type="checkbox" title="{{description}}" name="pc_{{id}}" id="pc_{{id}}" />\
                                {{else}}\
                                  {{#ifEquals type "enum"}}\
                                    <br><select class="alg-combobox" name="pc_{{id}}" id="pc_{{id}}" title="{{description}}"></select>\
                                  {{else}}\
                                    <input type="text" class="spininput" title="{{description}}" name="pc_{{id}}" id="pc_{{id}}" /> {{#ifEquals type "meter"}}m{{/ifEquals}}{{#ifEquals type "price"}}&euro;{{/ifEquals}}\
                                    {{/ifEquals}}\
                                {{/ifEquals}}\
                              </div>\
                            {{/each}}\
                          {{/if}}\
                        </div>\
                      </form>';
templates.algView = Handlebars.compile(templates.algView);

templates.markView = '<a href="#" class="view">{{name}}</a> {{position}}';
templates.markView = Handlebars.compile(templates.markView);

templates.aboutView = '<div class="modal-header">\
                        <a href="#" class="close">&times;</a>\
                        <h4>' + $._('About') + '</h4>\
                      </div>\
                      <div class="modal-body">\
                        ToureNPlaner was developed at the University of Stuttgart as part of a "Studienprojekt".<br />\
                        Visit our project page on <a href="http://tourenplaner.github.com/" target="_blank">GitHub</a>.\
                      </div>\
                      <div class="modal-footer">\
                        <a href="#" class="btn primary">' + $._('Close') + '</a>\
                      </div>';

templates.loginView = '<div class="modal-header">\
                        <h4>' + $._('Login') + '</h4>\
                       </div>\
                       <div class="modal-body">\
                        <div class="alert-message error error-empty">\
                          <p><strong>' + $._('Error!') + '</strong> ' + $._('Please fill out all fields.') + '</p>\
                        </div>\
                        <div class="alert-message error error-correct">\
                          <p><strong>' + $._('Error!') + '</strong> ' + $._('The email or password you entered was incorrect.') + '</p>\
                        </div>\
                        <form name="login" method="post" action="#login">\
                          <div class="clearfix">\
                            <label for="email">' + $._('Email') + ':</label>\
                            <div class="input">\
                              <input type="text" name="email" id="email" autofocus />\
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
                        <a href="#register" class="btn info register">' + $._('Register') + '</a>\
                        <a href="#login" class="btn primary login">' + $._('Login') + '</a>\
                       </div>';

templates.registerView = '<div class="modal-header">\
                              <a href="#" class="close">x</a>\
                              <h4>' + $._('Registration') + '</h4>\
                            </div>\
                            <div class="modal-body">\
                              <div class="alert-message error error-empty">\
                                <p><strong>' + $._('Error!') + '</strong> ' + $._('Please fill out all fields.') + '</p>\
                              </div>\
                              <div class="alert-message error error-correct">\
                                <p><strong>' + $._('Error!') + '</strong> ' + $._('There were errors in the form.') + '</p>\
                              </div>\
                              <form name="register" method="post" action="#register">\
                                <div class="clearfix">\
                                  <label for="firstname">' + $._('First name') + ': </label>\
                                  <div class="input">\
                                    <input type="text" name="firstname" id="firstname" autofocus />\
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
                              <a href="#register" class="btn primary register">' + $._('Register') + '</a>\
                            </div>';

templates.adminView =  '<div class="modal-header">\
                            <a href="#" class="close">x</a>\
                            <h4 class="title">' + $._('Administration') + '</h4>\
                        </div>\
                        <div class="modal-body">\
                            {{{content}}}\
                        </div>\
                        <div class="modal-footer">\
                            <a href="#" class="btn secondary back">' + $._('Back') + '</a>\
                            <a href="#" class="btn secondary cancel">' + $._('Close') + '</a>\
                        </div>';
templates.adminView = Handlebars.compile(templates.adminView);

templates.adminMainView =  '<a href="#admin/user" class="new-user">' + $._('Create New User') + '</a>\
                            <table class="zebra-striped">\
                                <thead>\
                                    <th>#</th>\
                                    <th>' + $._('First Name') + '</th>\
                                    <th>' + $._('Last Name') + '</th>\
                                    <th>' + $._('Email') + '</th>\
                                    <th>' + $._('Activated') + '</th>\
                                    <th>' + $._('Actions') + '</th>\
                                </thead>\
                                <tbody></tbody>\
                            </table>';

templates.adminTableRowView = '<tr>\
                                <td>{{user.userid}}</td>\
                                <td>{{user.firstname}}</td>\
                                <td>{{user.lastname}}</td>\
                                <td>{{user.email}}</td>\
                                <td class="center">{{#if user.active}}&#10004;{{else}}&#10006;{{/if}}</td>\
                                <td>\
                                    <a href="#" class="view"><img src="img/user--view.png" alt="' + $._('View requests') + '" title="' + $._('View requests') + '" /></a>\
                                    <a href="#" class="edit"><img src="img/user--pencil.png" alt="' + $._('Edit') + '" title="' + $._('Edit') + '" /></a>\
                                    <a href="#" class="delete"><img src="img/user--minus.png" alt="' + $._('Delete') + '" title="' + $._('Delete') + '" /></a>\
                                    {{#unless user.active}}\
                                        <a href="#" class="activate"><img src="img/tick.png" alt="' + $._('Activate') + '" title="' + $._('Activate') + '" /></a>\
                                    {{/unless}}\
                                </td>\
                              </tr>';
templates.adminTableRowView = Handlebars.compile(templates.adminTableRowView);

templates.userView =       '<h4>{{#if user.userid}}' + $._('User') + ' #{{user.userid}}{{else}}' + $._('New User') + '{{/if}}</h4>\
                            <div class="alert-message error error-empty">\
                              <p><strong>' + $._('Error!') + '</strong> ' + $._('Please fill out all fields.') + '</p>\
                            </div>\
                            <div class="alert-message error error-correct">\
                              <p><strong>' + $._('Error!') + '</strong> ' + $._('There were errors in the form.') + '</p>\
                            </div>\
                            <form name="edit-user" method="post" action="#admin/user/{{user.userid}}">\
                                <div class="clearfix">\
                                  <label for="firstname">' + $._('First name') + ': </label>\
                                  <div class="input">\
                                    <input type="text" name="firstname" id="firstname" value="{{user.firstname}}" autofocus />\
                                  </div>\
                                </div>\
                                <div class="clearfix">\
                                  <label for="lastname">' + $._('Last name') + ': </label>\
                                  <div class="input">\
                                    <input type="text" name="lastname" id="lastname" value="{{user.lastname}}" />\
                                  </div>\
                                </div>\
                                <div class="clearfix">\
                                  <label for="address">' + $._('Address') + ': </label>\
                                  <div class="input">\
                                    <textarea name="address" id="address">{{user.address}}</textarea>\
                                  </div>\
                                </div>\
                                <div class="clearfix">\
                                  <label for="email">' + $._('Email') + ': </label>\
                                  <div class="input">\
                                    <input type="text" name="email" id="email" value="{{user.email}}" />\
                                  </div>\
                                </div>\
                                <div class="clearfix">\
                                  <label for="password">' + $._('Password') + ': </label>\
                                  <div class="input">\
                                    <input type="password" name="password" id="password" />\
                                  </div>\
                                </div>\
                                <div class="clearfix">\
                                  <label for="password_confirm">' + $._('Confirm Password') + ': </label>\
                                  <div class="input">\
                                    <input type="password" name="password_confirm" id="password_confirm" />\
                                  </div>\
                                </div>\
                                {{#unless own_data}}\
                                <div class="clearfix">\
                                    <label for="active">' + $._('Activated') + ': </label>\
                                    <div class="input">\
                                        <input type="checkbox" name="active" id="active" {{#if user.active}}checked="checked"{{/if}}/>\
                                    </div>\
                                </div>\
                                <div class="clearfix">\
                                    <label for="administrator">' + $._('Administrator') + ': </label>\
                                    <div class="input">\
                                        <input type="checkbox" name="admin" id="administrator" {{#if user.admin}}checked="checked"{{/if}}/>\
                                    </div>\
                                </div>\
                                {{/unless}}\
                                <div class="clearfix input">\
                                    <a href="#" class="btn primary save">' + $._('Save') + '</a>\
                                </div>\
                            </form>';
templates.userView = Handlebars.compile(templates.userView);

templates.userDialogView = '<div class="modal-header">\
                              <a href="#" class="close">x</a>\
                              <h4 class="title">' + $._('Profile') + '</h4>\
                            </div>\
                            <div class="modal-body"></div>';

// billing
templates.billingView =  '<div class="modal-header">\
                            <a href="#" class="close">x</a>\
                            <h4 class="title">' + $._('Billing') + '</h4>\
                          </div>\
                          <div class="modal-body">\
                            {{#if admin}}\
                            <input type="checkbox" name="billingShowAll" id="billingShowAll" {{#if checked}}checked{{/if}} /> Show requests of all users\
                            {{/if}}\
                            {{{content}}}\
                          </div>\
                          <div class="modal-footer">\
                            <a href="#" class="btn secondary back">' + $._('Back') + '</a>\
                            <a href="#" class="btn secondary cancel">' + $._('Close') + '</a>\
                          </div>';
                   
templates.billingView = Handlebars.compile(templates.billingView);

templates.billingMainView =  '<table id="billing-table">\
                                <thead>\
                                    <th>#</th>\
                                    <th>' + $._('User ID') + '</th>\
                                    <th>' + $._('Algorithm') + '</th>\
                                    <th>' + $._('Cost') + '</th>\
                                    <th>' + $._('Request Date') + '</th>\
                                    <th>' + $._('Finish Date') + '</th>\
                                    <th>' + $._('Duration') + '</th>\
                                    <th>' + $._('Status') + '</th>\
                                </thead>\
                                <tbody>\
                                </tbody>\
                            </table>';

templates.billingTableRowView = '<tr>\
                                <td>{{request.requestid}}</td>\
                                <td>{{request.userid}}</td>\
                                <td>{{request.algorithm}}</td>\
                                <td>{{request.cost}}</td>\
                                <td><nobr>{{request.requestdate}}</nobr></td>\
                                <td><nobr>{{request.finisheddate}}</nobr></td>\
                                <td>{{request.duration}}</td>\
                                <td>{{request.status}}</td>\
                                </tr>';

templates.billingTableRowView = Handlebars.compile(templates.billingTableRowView);

templates.imexportView = '<div class="modal-header">\
                            <a href="#" class="close">x</a>\
                            <h4>' + $._('Im-/Export') + '</h4>\
                          </div>\
                          <div class="modal-body">\
                            <ul class="nav nav-tabs" id="ieTab">\
                              <li><a href="#import" data-toggle="tab">' + $._('Import') + '</a></li>\
                              <li><a href="#export" data-toggle="tab">' + $._('Export') + '</a></li>\
                            </ul>\
                              <div class="tab-pane" id="import">\
                                <p>' + $._('Choose a valid (exported) file on your harddrive and press "Import" to import all points and routes.') + '</p>\
                                <input type="file" name="file" id="file" /><br />\
                                <a href="#" class="btn primary import">' + $._('Import') + '</a>\
                              </div>\
                              <div class="tab-pane" id="export">\
                                <p>' + $._('Press "Export" to download a file containing all points and routes currently displayed. This may open a new browser window.') + '</p>\
                                <a href="#" class="btn primary export">' + $._('Export') + '</a>\
                              </div>\
                          </div>\
                          <div class="modal-footer">\
                            <a href="#" class="btn primary close">' + $._('Close') + '</a>\
                          </div>';

// pagination
templates.paginationView = '<div class="pagination">\
                              <div id="slider"></div>\
                              <div id="slider-control" style="width:290px; margin: 5px auto">\
                                <form class="form-inline">\
                                  <span class="input-append"><input type="button" id="slider-back" class="btn disabled" value="&larr; ' + $._('Previous') + '">\
                                  <input type="text" id="slider-val" class="input-mini"><span id="slider-max" class="add-on">/1000</span></span>\
                                  <input type="button" id="slider-next" class="btn disabled" value="' + $._('Next') + ' &rarr;">\
                                </form>\
                              </div>\
                            </div>';
templates.paginationView = Handlebars.compile(templates.paginationView);

templates.messageView = '<div class="modal-header">\
                            <a href="#" class="close">x</a>\
                            <h4 class="title">{{title}}</h4>\
                         </div>\
                         <div class="modal-body">\
                          <div class="message">{{message}}</div>\
                         </div>\
                         <div class="modal-footer">\
                          <a href="#" class="btn primary cancel">'+$._('Close')+'</a>\
                         </div>';
templates.messageView = Handlebars.compile(templates.messageView);

templates.loadingView = '<div class="modal-body">\
                            <a href="#" class="close">x</a>\
                            <div class="loading"><img src="img/loading.gif" alt="Loading" title="Loading" /></div>\
                            <div class="message">{{message}}</div>\
                         </div>';
templates.loadingView = Handlebars.compile(templates.loadingView);
