window.templates = window.templates || {};

templates.topbarView = '<div class="fill">\
                            <div class="container">\
                              <h3><a href="#">ToureNPlaner</a></h3>\
                              <form>\
                                <input type="text" placeholder="Search" />\
                              </form>\
                              <ul class="nav secondary-nav private-server">\
                                <li class="user"><a href="#" onclick="return false;"></a></li>\
                                <li class="menu">\
                                  <a class="menu" href="#">' + $._('Settings') + '</a>\
                                  <ul class="menu-dropdown">\
                                    <li><a href="#/settings">' + $._('Profile') + '</a></li>\
                                    <li><a href="#/billing">' + $._('Billing') + '</a></li>\
                                    <li><a href="#/import">' + $._('Im-/Export') + '</a></li>\
                                    <li class="admin"><a href="#/admin">' + $._('Administration') + '</a></li>\
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
                                <h3>' + $._('Points') + ': <a href="#" class="btn small secondary flip"><img src="img/arrow-switch.png" alt="' + $._('Switch order') + '" title="' + $._('Switch order') + '" /></a></h3>\
                                <div id="marks">' + $._('No points defined!') + '</div>\
                              </div>\
                              <div class="container">\
                                <a href="#" class="btn primary send">' + $._('Calculate Route') + '</a>\
                                <a href="#" class="btn secondary clear">' + $._('Clear') + '</a>\
                              </div>\
                            </form>\
                         </div>';

templates.dataView = '<span class="minmax">\
                        <a href="#">_</a>\
                      </span>\
                      <div class="content" id="dataview">\
                        <p style="padding: 5px 10px">' + $._('No point selected!') + '</p>\
                      </div>';

templates.dataViewContent = '<div class="clearfix"><label for="lon">' + $._('Lon') + ':</label><input size="10" value="{{lonlat.lon}}" type="text" name="lon" id="lon" disabled="disabled" /></div>\
                             <div class="clearfix"><label for="lat">' + $._('Lat') + ':</label><input size="10" value="{{lonlat.lat}}" type="text" name="lat" id="lat" disabled="disabled" /></div>\
                             <div class="clearfix"><label for="markerName">' + $._('Name') + ':</label><input value="{{marker.name}}" type="text" name="markerName" id="markerName" /></div>\
                             <div class="clearfix"><label for="markerPos">' + $._('Position') + ':</label><input value="{{marker.position}}" type="text" name="markerPos" id="markerPos" /></div>\
                             {{#if constraints}}\
                                <h4>Constraints</h4>\
                                {{{constraintsHtml}}}\
                             {{/if}}\
                             </div>\
                             <div class="clearfix"><label for="saveMarkAttributes" /><button id="saveMarkAttributes" class="btn primary">' + $._('Apply') + '</button><button id="deleteMark" class="btn secondary">' + $._('Delete') + '</button></div>';
templates.dataViewContent = Handlebars.compile(templates.dataViewContent);

// Helper for constraints
Handlebars.registerHelper('constraintsHelper', function (context) {
    // context: type, value, key
    var ret = "<div class='clearfix'><label for='pc_" + context.key + "'><b>" + context.key + ":</b></label>";
    switch (context.type) {
    case "boolean":
        // display a checkbox and set its checked state
        var checked = "";
        if (context.value == true) {
            checked = "checked";
        }
        ret += "<input type='checkbox' name='pc_" + context.key + "' id='pc_" + context.key + "' " + checked + "/></div>";
        break;

    case "integer":
        ret += "<input value='" + context.value + "' type='text' class='smartspinner' name='pc_" + context.key + "' id='pc_" + context.key + "' /></div>";
        break;

    case "float":
        ret += "<input value='" + context.value + "' type='text' class='smartspinner' name='pc_" + context.key + "' id='pc_" + context.key + "' /></div>";
        break;

    case "meter":
        ret += "<input value='" + context.value + "' type='text' class='smartspinner' name='pc_" + context.key + "' id='pc_" + context.key + "' /> m</div>";
        break;

    case "price":
        ret += "<input value='" + context.value + "' type='text' class='smartspinner' name='pc_" + context.key + "' id='pc_" + context.key + "' /> &#8364;</div>";
        break;
    }
    return ret;
});
templates.constraintsView = "{{{constraintsHelper this}}}";
templates.constraintsView = Handlebars.compile(templates.constraintsView);


templates.markView = '<div id="mark_{{cid}}" class="mark"><a href="#" class="view">{{name}}</a> {{position}}</div>';
templates.markView = Handlebars.compile(templates.markView);

templates.loginView = '<div class="modal-header">\
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
                        <a href="#/register" class="btn info register">' + $._('Register') + '</a>\
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
                              <a href="#/register" class="btn primary register">' + $._('Register') + '</a>\
                            </div>';


templates.adminView =  '<div class="modal-header">\
                            <a href="#" class="close">x</a>\
                            <h3 class="title">' + $._('Administration') + '</h3>\
                        </div>\
                        <div class="modal-body">\
                            {{{content}}}\
                        </div>\
                        <div class="modal-footer">\
                            <a href="#" class="btn secondary back">' + $._('Back') + '</a>\
                            <a href="#" class="btn secondary cancel">' + $._('Close') + '</a>\
                        </div>';
templates.adminView = Handlebars.compile(templates.adminView);

templates.adminMainView =  '<a href="#/admin/user" class="new-user">' + $._('Create New User') + '</a>\
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
                            <form name="edit-user" method="post" action="#/admin/user/{{user.userid}}">\
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
                                <div class="clearfix input">\
                                    <a href="#" class="btn primary save">' + $._('Save') + '</a>\
                                </div>\
                            </form>';
templates.userView = Handlebars.compile(templates.userView);

templates.userDialogView = '<div class="modal-header">\
                              <a href="#" class="close">x</a>\
                              <h3 class="title">' + $._('Profile') + '</h3>\
                            </div>\
                            <div class="modal-body"></div>';

// billing
templates.billingView =  '<div class="modal-header">\
                            <a href="#" class="close">x</a>\
                            <h3 class="title">' + $._('Billing') + '</h3>\
                          </div>\
                          <div class="modal-body">\
                            {{{content}}}\
                          </div>\
                          <div class="modal-footer">\
                            <a href="#" class="btn secondary back">' + $._('Back') + '</a>\
                            <a href="#" class="btn secondary cancel">' + $._('Close') + '</a>\
                          </div>';
templates.billingView = Handlebars.compile(templates.billingView);

templates.billingMainView =  '<table>\
                                <thead>\
                                    <th>#</th>\
                                    <th>' + $._('User ID') + '</th>\
                                    <th>' + $._('Algorithm') + '</th>\
                                    <th>' + $._('Costs') + '</th>\
                                    <th>' + $._('is Paid') + '</th>\
                                    <th>' + $._('Request Date') + '</th>\
                                    <th>' + $._('Finish Date') + '</th>\
                                    <th>' + $._('Duration') + '</th>\
                                    <th>' + $._('Status') + '</th>\
                                	<th style="display:none"></th>\
                                	<th style="display:none"></th>\
                                </thead>\
                                <tbody>\
                                </tbody>\
                            </table>';

templates.billingTableRowView = '<tr id="billing-{{request.requestid}}">\
                                <td>{{request.requestid}}</td>\
                                <td>{{request.userid}}</td>\
                                <td>{{request.algorithm}}</td>\
                                <td>{{request.costs}}</td>\
                                <td class="center">{{#if request.ispaid}}&#10004;{{else}}&#10006;{{/if}}</td>\
                                <td>{{request.requestdate}}</td>\
                                <td>{{request.finisheddate}}</td>\
                                <td>{{request.duration}}</td>\
                                <td>{{request.status}}</td>\
                                <td id="billing-request-{{request.requestid}}"style="display:none">{{request.request}}</td>\
                                <td id="billing-response-{{request.requestid}}"style="display:none">{{request.response}}</td>\
                                </tr>';
templates.billingTableRowView = Handlebars.compile(templates.billingTableRowView);

templates.imexportView = '<div class="modal-header">\
                            <a href="#" class="close">x</a>\
                            <h3>' + $._('Im-/Export') + '</h3>\
                          </div>\
                          <div class="modal-body">\
                            <ul class="tabs">\
                              <li class="active"><a href="#">' + $._('Import') + '</a></li>\
                              <li><a href="#">' + $._('Export') + '</a></li>\
                            </ul>\
                            <div id="import">\
                              <p>' + $._('Choose a valid (exported) file on your harddrive and press "Import" to import all points and routes.') + '</p>\
                              <input type="file" name="file" id="file" /><br />\
                              <a href="#" class="btn primary import">' + $._('Import') + '</a>\
                            </div>\
                            <div id="export">\
                              <p>' + $._('Press "Export" to download a file containing all points and routes currently displayed. This may open a new browser window.') + '</p>\
                              <a href="#" class="btn primary export">' + $._('Export') + '</a>\
                            </div>\
                          </div>\
                          <div class="modal-footer">\
                            <a href="#" class="btn secondary cancel">Close</a>\
                          </div>';

// pagination
templates.paginationView = '<div class="pagination">\
                                <ul>\
                                    <li class="prev disabled"><a href="#">&larr; ' + $._('Previous') + '</a></li>\
                                    {{{pages}}}\
                                    <li class="next disabled"><a href="#">' + $._('Next') + ' &rarr;</a></li>\
                                </ul>\
                            </div>';
templates.paginationView = Handlebars.compile(templates.paginationView);

templates.messageView = '<div class="modal-header">\
                            <a href="#" class="close">x</a>\
                            <h3 class="title">{{title}}</h3>\
                         </div>\
                         <div class="modal-body">\
                          <div class="message">{{message}}</div>\
                         </div>\
                         <div class="modal-footer">\
                          <a href="#" class="btn primary cancel">'+$._('Close')+'</a>\
                         </div>';
templates.messageView = Handlebars.compile(templates.messageView);

templates.loadingView = '<div class="body">\
                            <div class="loading"><img src="img/loading.gif" alt="Loading" title="Loading" /></div>\
                            <div class="message">{{message}}</div>\
                         </div>';
templates.loadingView = Handlebars.compile(templates.loadingView);
