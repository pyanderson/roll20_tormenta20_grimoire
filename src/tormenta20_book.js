'use strict'

function dummy_slugify(s){
  return s.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
}

function render_paragraphs(content, lines) {
  if (lines.length == 0) return content;
  return render_paragraphs(content + `<p>${lines[0]}</p>`, lines.slice(1))
}

function render_description(description) {
  return render_paragraphs('', description.split('\n\n'));
}

function render_modal_info(parent, name, description) {
  const suffix_id = `${dummy_slugify(parent)}-${dummy_slugify(name)}`;
  const modal = `
    <div id="tormenta20-info-${suffix_id}" class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-draggable ui-resizable" style="outline: currentcolor none 0px; z-index: 10517; position: fixed; height: 390px; width: 552px; top: 121px; left: 540px; display: block;" tabindex="-1" role="dialog" aria-labelledby="ui-id-${suffix_id}">
      <div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">
        <span id="ui-id-${suffix_id}" class="ui-dialog-title">${name}</span>
        <a href="#" class="ui-dialog-titlebar-close ui-corner-all" role="button" id="tormenta20-close-button-${suffix_id}"><span class="ui-icon ui-icon-closethick">close</span></a>
      </div>
      <div class="ui-resizable-handle ui-resizable-n" style="z-index: 1000;"></div>
      <div class="ui-resizable-handle ui-resizable-e" style="z-index: 1000;"></div>
      <div class="ui-resizable-handle ui-resizable-s" style="z-index: 1000;"></div>
      <div class="ui-resizable-handle ui-resizable-w" style="z-index: 1000;"></div>
      <div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se ui-icon-grip-diagonal-se" style="z-index: 1000;"></div>
      <div class="ui-resizable-handle ui-resizable-sw" style="z-index: 1000;"></div>
      <div class="ui-resizable-handle ui-resizable-ne" style="z-index: 1000;"></div>
      <div class="ui-resizable-handle ui-resizable-nw" style="z-index: 1000;"></div>
      <div id="tormenta20-info-content-${suffix_id}" class="dialog ui-dialog-content ui-widget-content" style="display: block; width: auto; min-height: 0px; height: 303px;" scrolltop="0" scrollleft="0">
        <div class="dialog largedialog handoutviewer" style="display: block;">
           <div style="padding: 10px;">
              <div class="row-fluid">
                 <div class="span12">
                    <div class="content note-editor notes">${render_description(description)}</div>
                    <div class="clear"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
    `;
  $('body').append(modal);
  $(`#tormenta20-info-${suffix_id}`).draggable({handle: 'div.ui-dialog-titlebar'});
  $(`#tormenta20-close-button-${suffix_id}`).on('click', function() {
    $(`#tormenta20-info-${suffix_id}`).remove();
  });
}

function render_info_template(name, description) {
  return `&{template:t20-info}{{infoname=${name}}}{{description=${description}}}`;
}

function active_tree_view() {
  const toggler = document.getElementsByClassName('tormenta20-book-folder');
  for (let i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener('click', function() {
      this.parentElement.querySelector('.tormenta20-book-nested-folder').classList.toggle('tormenta20-book-active-folder');
      this.classList.toggle('tormenta20-book-folder-open');
    });
  }

  $('[name="tormenta20-chat-info-button"]').on('click', function() {
    const div = $(this);
    $('#textchat-input .ui-autocomplete-input').val(render_info_template(div.attr('item-name'), div.attr('item-description')));
    $('#textchat-input .btn').click();
  });

  $('[name="tormenta20-modal-info-button"]').on('click', function() {
    const div = $(this);
    render_modal_info(div.attr('item-parent'), div.attr('item-name'), div.attr('item-description')); 
  });
}

function render_book_item(parent, item) {
  return `
  <li class="tormenta20-book-row journalitem dd-item">
    <div class="tormenta20-book-chat-icon" name="tormenta20-chat-info-button" item-name="${item.name}" item-description="${item.description}">
      <a class="pictos">q</a>
    </div>
    <div class="tormenta20-book-item-name dd-content" name="tormenta20-modal-info-button" item-parent="${parent}" item-name="${item.name}" item-description="${item.description}">
      ${item.name}
    </div>
  </li>`;
}

function render_book_items(parent, content, items) {
  if (items.length == 0) return content;
  return render_book_items(parent, content + render_book_element(parent, items[0]), items.slice(1));
}

function render_book_folder(parent, folder) {
  return `
    <li class="dd-item dd-folder">
      <span class="tormenta20-book-folder dd-content">${folder.name}</span>
      <ul class="tormenta20-book-nested-folder">
        ${render_book_items(`${parent}-${folder.name}`, '', folder.items)}
      </ul>
    </li>
  `;
}

function render_book_element(parent, element) {
  if (element.type == 'folder')
    return render_book_folder(parent, element);
  return render_book_item(parent, element);
}

function render_book_elements(parent, content, elements) {
  if (elements.length == 0) return content;
  return render_book_elements(parent, content + render_book_element(parent, elements[0]), elements.slice(1));
}

function render_book_content(rules) {
  return `
    <ul id="tormenta20_book_content" class="dd-list dd folderroot">
      ${render_book_elements('', '', rules)}
    </ul>
  `;
}

function render_book_tab(book, retry=20) { // wait the tab for 20 seconds then give up
  if (retry <= 0) return;
  const rightsidebar = $('#rightsidebar');
  const settings_tab = rightsidebar.find('[aria-controls="vm_settings_categories"][role="tab"]')
  const journal_content = rightsidebar.find('#journal');
  rightsidebar.find('[aria-controls="tormenta20_book"][role="tab"]').remove();
  rightsidebar.find("#tormenta20_book").remove();

  if(settings_tab.length == 0) {
    return setTimeout(() => {render_book_tab(retry-1)}, 1000); // wait one second and try again
  }

  const book_tab = settings_tab.clone(true);
  const book_content = journal_content.clone(true).html(render_book_content(book.rules));

  // set tab attrs
  book_tab
    .attr('title', 'Tormenta20 Rules')
    .attr('aria-controls', 'tormenta20_book')
    .attr('aria-labelledby', 'ui-id-tormenta20');
  book_tab.find('a')
    .attr('id', 'ui-id-tormenta20')
    .attr('href', '#tormenta20_book')
    .html($('<img>', {'src': book.icon, 'class': 'tormenta20-book-icon'}));

  // set content attrs
  book_content
    .attr('id', 'tormenta20_book')
    .attr('aria-labelledby', 'ui-id-tormenta20');

  // render the book
  settings_tab.before(book_tab);
  journal_content.after(book_content);

  active_tree_view();
}

function fix_right_sidebar() {
  // the rightsidebar is not responsive, so we need to increase the min width
  // to not break the right sidebar after adding a new menu item
  const items_count = $('#rightsidebar').find('li[role="tab"]').length + 1
  const min_width = Math.max(300, items_count * 39);

  $('#rightsidebar').resizable({
    handles: 'w',
    alsoResize: '#textchat-input, #rightsidebar .tabmenu',
    minWidth: min_width,
    start() {
      $('#editor-wrapper, #canvas-overlay').addClass('noshow');
    },
    resize() {},
    stop() {
      $('#editor-wrapper, #canvas-overlay').removeClass('noshow');
      $(window).trigger('resize');
      $('#rightsidebar')
        .css('left', '')
        .css('height', '100%');
    },
  });

  $('#rightsidebar').width(min_width);
  $('#rightsidebar .tabmenu').width(min_width - 5);
  $(window).trigger('resize');
};

$(document).ready(function () {
  window.addEventListener("message", function(event) {
    if (event.source != window)
      return;
    if (event.data.type && (event.data.type == "FROM_CONTENT")) {
      fix_right_sidebar();
      render_book_tab(JSON.parse(event.data.text));
    }
  }, false)
})