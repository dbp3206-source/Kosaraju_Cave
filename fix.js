const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The corrupted block has </aside>m Hiểm</div> followed by <div class="log-box"... and </aside>
const badStr1 = `</aside>m Hiểm</div>
                 <div class="log-box" id="game-log"></div>
             </div>
         </aside>`;
const badStr2 = `</aside>m Hiểm</div>\r\n                 <div class="log-box" id="game-log"></div>\r\n             </div>\r\n         </aside>`;
const badStr3 = `</aside>m Hiểm</div>\n                 <div class="log-box" id="game-log"></div>\n             </div>\n         </aside>`;
         
if (content.includes(badStr1)) {
    content = content.replace(badStr1, '</aside>');
} else if (content.includes(badStr2)) {
    content = content.replace(badStr2, '</aside>');
} else if (content.includes(badStr3)) {
    content = content.replace(badStr3, '</aside>');
} else {
    // try regex
    content = content.replace(/<\/aside>m Hiểm<\/div>[\s\S]*?<\/aside>/, '</aside>');
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Done');
