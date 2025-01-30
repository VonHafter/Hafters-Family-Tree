document.getElementById('add-member').addEventListener('click', openPopup);
document.getElementById('import-tree').addEventListener('click', importTree);
document.querySelector('.close').addEventListener('click', closePopup);
document.getElementById('member-form').addEventListener('submit', addFamilyMember);

let familyTree = [];
let lastNameCounts = {};
let boxSize = 100;
let generationGap = 200;

function openPopup() {
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

function addFamilyMember(event) {
    event.preventDefault();
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const birthYear = document.getElementById('birth-year').value;
    const deathYear = document.getElementById('death-year').value;
    const gender = document.getElementById('gender').value;

    if (!lastNameCounts[lastName]) {
        lastNameCounts[lastName] = 0;
    }
    lastNameCounts[lastName]++;
    const id = `${lastName}_${lastNameCounts[lastName]}`;
    const member = { id, firstName, lastName, birthYear, deathYear, gender, children: [], generation: 0, box: 0 };
    familyTree.push(member);
    displayFamilyTree();
    closePopup();
}

function displayFamilyTree() {
    const container = document.getElementById('family-tree-container');
    container.innerHTML = '';
    familyTree.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'family-member';
        memberDiv.draggable = true;
        memberDiv.innerHTML = `${member.firstName} ${member.lastName} (ID: ${member.id})<br><span class="details">Born: ${member.birthYear}, Died: ${member.deathYear || 'N/A'}</span>`;
        memberDiv.style.top = `${member.generation * generationGap}px`;
        memberDiv.style.left = `${member.box * boxSize}px`;
        memberDiv.addEventListener('dragstart', dragStart);
        memberDiv.addEventListener('dragover', dragOver);
        memberDiv.addEventListener('drop', drop);
        container.appendChild(memberDiv);
    });
    drawConnections();
}

function dragStart(event) {
    event.dataTransfer.setData('text', event.target.textContent);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const draggedData = event.dataTransfer.getData('text');
    const targetData = event.target.textContent;
    const draggedMember = familyTree.find(member => `${member.firstName} ${member.lastName} (ID: ${member.id})` === draggedData);
    const targetMember = familyTree.find(member => `${member.firstName} ${member.lastName} (ID: ${member.id})` === targetData);
    if (draggedMember && targetMember) {
        targetMember.children.push(draggedMember.id);
        draggedMember.generation = targetMember.generation + 1;
        draggedMember.box = findAvailableBox(draggedMember.generation, targetMember.box);
        displayFamilyTree();
    }
}

function findAvailableBox(generation, startBox) {
    let box = startBox;
    while (familyTree.some(member => member.generation === generation && member.box === box)) {
        box++;
    }
    return box;
}

function drawConnections() {
    const container = document.getElementById('family-tree-container');
    familyTree.forEach(member => {
        const parentDiv = Array.from(container.children).find(div => div.textContent.includes(member.id));
        member.children.forEach(childId => {
            const childDiv = Array.from(container.children).find(div => div.textContent.includes(childId));
            if (parentDiv && childDiv) {
                const line = document.createElement('div');
                line.className = 'connection-line';
                const parentRect = parentDiv.getBoundingClientRect();
                const childRect = childDiv.getBoundingClientRect();
                line.style.width = `${Math.abs(parentRect.left - childRect.left)}px`;
                line.style.top = `${parentRect.bottom}px`;
                line.style.left = `${Math.min(parentRect.left, childRect.left)}px`;
                container.appendChild(line);
                childDiv.style.top = `${parentRect.bottom + 20}px`;
                childDiv.style.left = `${parentRect.left}px`;
            }
        });
    });
}

function exportTree() {
    const hftContent = familyTree.map(member => 
        `Member: ${member.firstName} ${member.lastName}, ID: ${member.id}, Birth Year: ${member.birthYear}, Death Year: ${member.deathYear}, Gender: ${member.gender}, Children: ${member.children.join(', ')}`
    ).join('\n');
    const blob = new Blob([hftContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'family_tree.hft';
    link.click();
}

function importTree() {
    const importCode = document.getElementById('export-code').value;
    if (importCode) {
        familyTree = JSON.parse(atob(importCode));
        displayFamilyTree();
    }
}
