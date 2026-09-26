import ChildModel from "../child/child.model.js";
import NoteModel, { MAX_NOTES_PER_PARENT } from "./note.model.js";

const serializeNote = (note) => ({
  _id: note._id,
  date: note.date,
  text: note.text,
  child: note.childId
    ? {
        _id: note.childId._id,
        name: note.childId.name,
        gender: note.childId.gender,
      }
    : null,
});

const populateChild = { path: "childId", model: ChildModel, select: "name gender" };

export const getNotes = async (req, res) => {
  const notes = await NoteModel.find({ parentId: req.user._id })
    .sort({ date: -1, _id: -1 })
    .limit(MAX_NOTES_PER_PARENT)
    .populate(populateChild);

  return res.status(200).json(notes.map(serializeNote));
};

export const addNote = async (req, res) => {
  const parent = req.user;
  const { childId } = req.body;
  const text = req.body.text.trim();

  const isOwnChild = parent.children.some((id) => id.toString() === childId);
  if (!isOwnChild) {
    return res.status(404).json({ message: "Child not found" });
  }

  const note = await NoteModel.create({ text, childId, parentId: parent._id });

  // Keep only the latest MAX_NOTES_PER_PARENT notes: the oldest ones are removed
  const staleNotes = await NoteModel.find({ parentId: parent._id })
    .sort({ date: -1, _id: -1 })
    .skip(MAX_NOTES_PER_PARENT)
    .select("_id");
  if (staleNotes.length) {
    await NoteModel.deleteMany({ _id: { $in: staleNotes.map(({ _id }) => _id) } });
  }

  await note.populate(populateChild);
  return res.status(201).json(serializeNote(note));
};

export const deleteNote = async (req, res) => {
  const deletedNote = await NoteModel.findOneAndDelete({
    _id: req.params.noteId,
    parentId: req.user._id,
  });
  if (!deletedNote) {
    return res.status(404).json({ message: "Note not found" });
  }
  return res.status(204).end();
};

export const deleteAllNotes = async (req, res) => {
  await NoteModel.deleteMany({ parentId: req.user._id });
  return res.status(204).end();
};
