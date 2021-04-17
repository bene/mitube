import {Fragment, useEffect, useRef, useState} from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { DownloadIcon } from '@heroicons/react/outline'

export default function DownloadModal() {
    const [urlInput, setUrlInput] = useState("")
    const [isOpen, setOpen] = useState(false)
    const [isDownloading, setDownloading] = useState(false)
    const [isDisabled, setDisabled] = useState(false)
    const inputRef = useRef()

    useEffect(async () => {
        if (!isOpen) {
            setUrlInput("")
            return
        }

        const clipboardText = await navigator.clipboard.readText();

        if (typeof clipboardText === "string" && isValid(clipboardText)) {
            setUrlInput(clipboardText)
        }

    }, [isOpen])

    useEffect(() => {
        setDisabled(!isValid(urlInput) || isDownloading)
    }, [urlInput, isDownloading])

    useEffect(() => {

        if (isDownloading) {
            fetch(`/api/download`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: urlInput
                })
            }).then(res => {
                if (res.ok) {
                    setOpen(false)
                }
            }).catch(err => {
                console.log(err)
            }).finally(() => {
                setDownloading(false)
            })
        }

    }, [isDownloading])

    const isValid = (input) => {
        // TODO
        return ["youtube.com", "youtu.be"].some(schema => input.includes(schema))
    }

    return (
        <>
            <Transition.Root show={isOpen} as={Fragment}>
                <Dialog
                    as="div"
                    static
                    className="fixed z-10 inset-0 overflow-y-auto"
                    initialFocus={inputRef}
                    open={isOpen}
                    onClose={setOpen}
                    dis
                >
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        </Transition.Child>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <div>
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                        <DownloadIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                                            Download new video.
                                        </Dialog.Title>
                                    </div>
                                    <div>
                                        <label htmlFor="link" className="sr-only">
                                            YouTube Link
                                        </label>
                                        <input
                                            ref={inputRef}
                                            value={ urlInput }
                                            onChange={e => setUrlInput(e.target.value)}
                                            type="url"
                                            name="link"
                                            id="link"
                                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md text-center mt-3"
                                            placeholder="https://youtu.be/dQw4w9WgXcQ"
                                        />
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="button"
                                        onClick={() => setDownloading(true)}
                                        disabled={isDisabled}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                                    >
                                        Download
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"

                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <button type="button" onClick={() => setOpen(true)} disabled={isDownloading} className="rounded-full p-3 bg-gray-700 text-white fixed right-4 bottom-4 shadow">
                <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                </svg>
            </button>
        </>
    )
}
