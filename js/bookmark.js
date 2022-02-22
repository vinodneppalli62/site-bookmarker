'use strict'
    var button_import = document.getElementById("bookmark-import");
    var button_export = document.getElementById("bookmark-export");
    var button_save=  document.getElementById("bookmark-save");
    var bookmarkResults=  document.getElementById("bookmarkResults");
    document.getElementById("bookmark-csv-file").addEventListener('change',enableDisableImportButton);
    document.getElementById("bookmark-html-file").addEventListener('change',enableDisableImportButton);
    bookmarkResults.addEventListener('DOMNodeInserted',enableDisableExportButton);
    bookmarkResults.addEventListener('DOMNodeRemoved',enableDisableExportButton);
    button_import.addEventListener("click",importBookmarks);
    button_save.addEventListener("click",saveBookmark);
    button_export.addEventListener("click",exportToFile);
    
    function saveBookmark(event){
        var siteName = document.getElementById("siteName").value;
        var siteUrl = document.getElementById("siteUrl").value;
        var siteFolder= document.getElementById("siteFolder").value;
        
        if(!validateBookmarkForm(siteName,siteUrl)){
            return false;
        }
        var bookmark = {
            name:siteName.charAt(0).toUpperCase() + siteName.slice(1),
            url:siteUrl,
            folder: siteFolder || "Other"
        };
    
        if(localStorage.getItem("bookmarks") === null){
            localStorage.setItem("bookmarks",JSON.stringify([bookmark]));
        }else{
            var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
            var isBookmarkPresent = bookmarks.filter(function(bookmark){
                return bookmark.folder === siteFolder && bookmark.url === siteUrl;
            }).length > 0;
            if(!isBookmarkPresent){
                bookmarks.push(bookmark);
                localStorage.setItem("bookmarks",JSON.stringify(bookmarks));
            }else{
                alert("Bookmark already exists.");
            }
        }
        document.getElementById("bookmark-form").reset();
        
        fetchBookmarks();
        event.preventDefault();
    }
    
    function fetchBookmarks(){
        var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
        if(bookmarks && bookmarks.length > 0){
           prepareFolderDropdown(getGroupedListByFolder(bookmarks));
           changeFolder("");
        }
    }

    function prepareFolderDropdown(groupedBookmarks) {
            var folderOptions = "<option value='' disabled selected>Folder</option>";
            for (var key in groupedBookmarks) {
                folderOptions += "<option value='"+key+"'>" + key+ "</option>";
            }
            document.getElementById("folder").innerHTML = folderOptions;
    }

    function changeFolder(value) {
        var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
        var groupedBookmarks =getGroupedListByFolder(bookmarks);
        if (value.length == 0) document.getElementById("siteResults").innerHTML = "<option value='' disabled selected>Sites</option>";
        else {
            var siteOptions = "<option value='' disabled selected>Sites</option>";
            groupedBookmarks[value].forEach(function(option){
                siteOptions += "<option>" + option.name + "</option>";
            });
            document.getElementById("siteResults").innerHTML = siteOptions;
        }
        var bookmarksResults = document.getElementById("bookmarkResults");
        bookmarksResults.innerHTML = "";
    }

    function changeSiteDropdownOption(value) {
        var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
        var bookmarksResults = document.getElementById("bookmarkResults");
        bookmarksResults.innerHTML = ""
        if (value.length == 0) return false;
        else {
              var bookmark = bookmarks.filter(function(item){
                  return item.name === value;
              });
              bookmarksResults.innerHTML +='<div class="bg-light">'+
                                              '<label id="website-name">'+bookmark[0].name+
                                               ' <a id="view" href="'+bookmark[0].url+'" title="'+bookmark[0].name+', view bookmark" target="_blank" class="btn btn-success" style="float:left;margin-right:2px"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">'+
                                               ' <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>'+
                                               ' <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>'+
                                               ' </svg></a> '+
                                               ' <a id="delete" onclick="deleteBookmark(\''+bookmark[0].url+'\')" title="'+bookmarks[0].name+', delete bookmark" href="#" class="btn btn-danger"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">'+
                                               ' <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>'+
                                               ' </svg></a> '+
                                               '</label>'+
                                               '</div>';
        }
    }

    function getGroupedListByFolder(bookmarks){
        return bookmarks.reduce((group, bookmark) => {
            var { folder } = bookmark;
            group[folder] = group[folder] ?? [];
            group[folder].push(bookmark);
            return group;
          }, {});
    }

    
    function deleteBookmark(url){
        var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
        bookmarks.filter(function(bookmark,index){
            if(bookmark.url === url)
             bookmarks.splice(index,1);
        });
        localStorage.setItem("bookmarks",JSON.stringify(bookmarks));
        fetchBookmarks();
    }
    
    
    function validateBookmarkForm(name,url){
        if(!name || !url){
            alert("Please fill in form fields");
            return false;
        }
    
        var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        var regex = new RegExp(expression);
    
        if (!url.match(regex)){
            alert("Please enter a valid URL.");
            return false;
        }else
            return true;
    
    }
    
    function exportToFile(event){
        event.preventDefault();
        var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
        var arrayHeader = ["name","url","folder"];
        export_csv(arrayHeader,bookmarks,",","Bookmarks");
    }
    
    function export_csv(arrayHeader, arrayData, delimiter, fileName) {
        
        var header = arrayHeader.join(delimiter) + '\n';
        var csv = header;
        arrayData.forEach( obj => {
            var row = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    row.push(obj[key]);
                }
            }
            csv += row.join(delimiter)+"\n";
        });
    
        var csvData = new Blob([csv], { type: 'text/csv' });  
        var csvUrl = URL.createObjectURL(csvData);
    
        var hiddenElement = document.createElement('a');
        hiddenElement.href = csvUrl;
        hiddenElement.target = '_blank';
        hiddenElement.download = fileName + '.csv';
        hiddenElement.click();
    }
    
    function importBookmarks(event){
        event.preventDefault();
        var csvFile = document.getElementById("bookmark-csv-file");
        var htmlFile = document.getElementById("bookmark-html-file");
        var file = csvFile.files.length > 0 ? csvFile.files[0] : htmlFile.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            var importedBookmarks = [];
            if(file.type === "text/csv")
              importedBookmarks = csvToArray(e.target.result,",");
            else
              importedBookmarks = htmlToArray(e.target.result);

            if(importedBookmarks.length > 0){
                var bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
                if(bookmarks === null){
                    bookmarks = importedBookmarks;
                }else{
                    bookmarks.push(...importedBookmarks)
                    bookmarks = Array.from(new Set(bookmarks.map(JSON.stringify))).map(JSON.parse)
                }
                localStorage.setItem("bookmarks",JSON.stringify(bookmarks));
                fetchBookmarks();
            }
            button_import.disabled = true;
            document.getElementById("bookmark-form").reset();
        };
        reader.readAsText(file);
    }
    
    function csvToArray(str, delimiter) {
        
        var headers = str.slice(0, str.indexOf("\n")).split(delimiter);
      
        var rows = str.slice(str.indexOf("\n") + 1).split("\n");
        rows.pop();
      
        var arr = rows.map(function (row) {
          var values = row.split(delimiter);
          var el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
          }, {});
          return el;
        });
      
        return arr;
    }

    function htmlToArray(str){
        var htmlObject = $(str);
        var folderNodes = htmlObject.contents().find("H3");
        var allLinks = htmlObject.contents().find("A");
        var arr = []
        for(var nodeIndex = 0;nodeIndex < folderNodes.length;nodeIndex++){
            if(folderNodes[nodeIndex].tagName === "H3"){
                var folderName = folderNodes[nodeIndex].innerText;
                var childNodes = folderNodes[nodeIndex].nextElementSibling.childNodes;
               for(var i = 0;i<childNodes.length;i++){
                   if(childNodes[i].firstChild.tagName === "A"){
                    arr.push({"name":childNodes[i].firstChild.text,"url":childNodes[i].firstChild.href,"folder":folderName});
                   }
               }
            }
        }
        for(var i = 0; i<allLinks.length;i++){
            var isNotPresent = arr.filter(function(item){
                return item.url === allLinks[i].href;
            }).length === 0;
            if(isNotPresent){
                arr.push({"name":allLinks[i].text,"url":allLinks[i].href,"folder":"Other Bookmarks"});
            }
        }
        return arr;
    }

    function enableDisableImportButton(e){
        var filename=e.target.value;
         if(filename)
          button_import.disabled = false;
          else
          button_import.disabled = true;
    }

    function enableDisableExportButton(e){
       if(e.type === "DOMNodeInserted"  || (e.type === "DOMNodeRemoved" && e.target.childElementCount > 1))
        button_export.disabled = false;
       else
        button_export.disabled = true;
    }
