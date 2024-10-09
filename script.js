class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    async insert(word) {
        this.displayCppCode("insert");
        let node = this.root;
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            this.highlightCppLine(2);
            await this.sleep(500);
            if (!node.children[char]) {
                this.highlightCppLine(3);
                node.children[char] = new TrieNode();
                await this.sleep(500);
            }
            node = node.children[char];
            this.highlightCppLine(4);
            await this.sleep(500);
        }
        node.isEndOfWord = true;
        this.highlightCppLine(6);
        visualizeTrie(this.getTrieStructure());
    }

    async delete(word) {
        this.displayCppCode("delete");
        await this.deleteHelper(this.root, word, 0);
        visualizeTrie(this.getTrieStructure());
    }

    async deleteHelper(node, word, depth) {
        if (depth === word.length) {
            this.highlightCppLine(2);
            await this.sleep(500);
            if (!node.isEndOfWord) return false;
            node.isEndOfWord = false;
            return Object.keys(node.children).length === 0;
        }

        const char = word[depth];
        this.highlightCppLine(3);
        await this.sleep(500);
        if (!node.children[char]) return false;

        const shouldDeleteChild = await this.deleteHelper(node.children[char], word, depth + 1);
        if (shouldDeleteChild) {
            this.highlightCppLine(6);
            delete node.children[char];
            return Object.keys(node.children).length === 0;
        }
        return false;
    }

    async replace(oldWord, newWord) {
        this.displayCppCode("replace");
        this.highlightCppLine(1);
        await this.sleep(500);
        if (this.search(oldWord)) {
            this.highlightCppLine(2);
            await this.sleep(500);
            await this.delete(oldWord);
            this.highlightCppLine(3);
            await this.sleep(500);
            await this.insert(newWord);
        } else {
            this.highlightCppLine(4);
            await this.sleep(500);
            alert(`The word "${oldWord}" does not exist in the Trie.`);
        }
    }

    search(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }
        return node.isEndOfWord;
    }

    async createRandomTrie(numWords, wordLength) {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        const randomWords = [];

        for (let i = 0; i < numWords; i++) {
            let word = '';
            for (let j = 0; j < wordLength; j++) {
                const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
                word += randomChar;
            }
            randomWords.push(word);
        }

        for (const word of randomWords) {
            await this.insert(word);
        }

        visualizeTrie(this.getTrieStructure());
    }

    displayCppCode(type) {
        const cppCode = {
            insert: `TrieNode* node = root;\nfor (char c : word) {\n    if (node->children.find(c) == node->children.end()) {\n        node->children[c] = new TrieNode();\n    }\n    node = node->children[c];\n}\nnode->isEndOfWord = true;`,
            delete: `bool deleteHelper(TrieNode* node, string word, int depth = 0) {\n    if (depth == word.size()) {\n        if (!node->isEndOfWord) return false;\n        node->isEndOfWord = false;\n        return node->children.empty();\n    }\n    char c = word[depth];\n    if (node->children.find(c) == node->children.end()) return false;\n    bool shouldDelete = deleteHelper(node->children[c], word, depth + 1);\n    if (shouldDelete) {\n        delete node->children[c];\n        return node->children.empty();\n    }\n    return false;\n}`,
            replace: `if (search(oldWord)) {\n    delete(oldWord);\n    insert(newWord);\n} else {\n    cout << "Word not found";\n}`
        };

        document.getElementById("cppCode").innerText = cppCode[type].trim();
    }

    highlightCppLine(lineNumber) {
        const codeElement = document.getElementById("cppCode");
        const lines = codeElement.innerText.split("\n");
        codeElement.innerHTML = lines
            .map((line, index) => index === lineNumber ? `<span class="highlight">${line}</span>` : line)
            .join("\n");
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getTrieStructure() {
        return this.root;
    }
}

const trie = new Trie();

document.getElementById('insertButton').addEventListener('click', async () => {
    const word = document.getElementById('wordInput').value.trim();
    if (word) {
        await trie.insert(word);
        document.getElementById('wordInput').value = '';
    }
});

document.getElementById('deleteButton').addEventListener('click', async () => {
    const word = document.getElementById('wordInput').value.trim();
    if (word) {
        await trie.delete(word);
        document.getElementById('wordInput').value = '';
    }
});

document.getElementById('replaceButton').addEventListener('click', async () => {
    const input = document.getElementById('wordInput').value.split(',');
    if (input.length === 2) {
        await trie.replace(input[0].trim(), input[1].trim());
        document.getElementById('wordInput').value = '';
    } else {
        alert('Please enter the old and new strings separated by a comma.');
    }
});

// New button for creating a random Trie
document.getElementById('createRandomTrieButton').addEventListener('click', async () => {
    const numWords = parseInt(prompt("Enter the number of random words to generate:"));
    const wordLength = parseInt(prompt("Enter the length of each random word:"));
    
    if (numWords > 0 && wordLength > 0) {
        await trie.createRandomTrie(numWords, wordLength);
    } else {
        alert("Please enter valid positive numbers for both fields.");
    }
});

function visualizeTrie(root) {
    const width = 500;
    const height = 400;

    const svg = d3.select("#trieContainer").html("").append("svg")
        .attr("width", width)
        .attr("height", height);

    const treeLayout = d3.tree().size([width - 100, height - 100]);
    const rootData = d3.hierarchy(root, d => Object.entries(d.children || {}).map(([key, value]) => ({ key, ...value })));

    const treeData = treeLayout(rootData);
    const nodes = treeData.descendants();
    const links = treeData.links();

    svg.selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.x + 50)
        .attr("y1", d => d.source.y + 50)
        .attr("x2", d => d.target.x + 50)
        .attr("y2", d => d.target.y + 50)
        .attr("stroke", "#ccc");

    const node = svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x + 50},${d.y + 50})`);

    node.append("circle")
        .attr("r", 15)
        .attr("fill", d => d.data.isEndOfWord ? "lightgreen" : "lightblue");

    node.append("text")
        .attr("dy", 3)
        .attr("text-anchor", "middle")
        .text(d => d.data.key);
}
