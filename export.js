document.getElementById('export-tree').addEventListener('click', exportTree);

function exportTree() {
    const exportCode = btoa(JSON.stringify(familyTree));
    document.getElementById('export-code').value = exportCode;

    const hftContent = familyTree.map(member => 
        `Member: ${member.firstName} ${member.lastName}, ID: ${member.id}, Birth Year: ${member.birthYear}, Death Year: ${member.deathYear}, Gender: ${member.gender}, Children: ${member.children.join(', ')}`
    ).join('\n');
    const blob = new Blob([hftContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'family_tree.hft';
    link.click();
}
