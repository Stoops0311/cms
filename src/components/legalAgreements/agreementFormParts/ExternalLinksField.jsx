import React from 'react';
    import { Button } from '@/components/ui/button.jsx';
    import { Input } from '@/components/ui/input.jsx';
    import { Label } from '@/components/ui/label.jsx';
    import { Link2, PlusCircle, Trash2 } from 'lucide-react';

    const ExternalLinksField = ({ externalDocumentLinks, setExternalDocumentLinks }) => {
      const addExternalLink = () => {
        setExternalDocumentLinks([...externalDocumentLinks, { id: `link-${Date.now()}`, title: '', url: '' }]);
      };

      const updateExternalLink = (index, field, value) => {
        const newLinks = [...externalDocumentLinks];
        newLinks[index][field] = value;
        setExternalDocumentLinks(newLinks);
      };

      const removeExternalLink = (index) => {
        setExternalDocumentLinks(externalDocumentLinks.filter((_, i) => i !== index));
      };

      return (
        <>
          <Button type="button" size="sm" onClick={addExternalLink} className="mb-2"><PlusCircle className="mr-2 h-4 w-4"/>Add External Link</Button>
          {externalDocumentLinks.map((link, index) => (
            <div key={link.id} className="flex items-center space-x-2 mb-2 p-2 border rounded-md">
              <Input value={link.title} onChange={e => updateExternalLink(index, 'title', e.target.value)} placeholder="Link Title (e.g., Master Plan)" className="flex-grow"/>
              <Input value={link.url} onChange={e => updateExternalLink(index, 'url', e.target.value)} placeholder="https://example.com/document.pdf" className="flex-grow"/>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeExternalLink(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
            </div>
          ))}
          {externalDocumentLinks.length === 0 && <p className="text-xs text-muted-foreground">No external links added.</p>}
        </>
      );
    };

    export default ExternalLinksField;