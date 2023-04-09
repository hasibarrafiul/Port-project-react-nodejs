import React, { useState, Fragment, useEffect, Suspense } from "react";
import { Dialog, Transition } from "@headlessui/react";
import ReadOnlyRow from "./TableRows/ReadOnlyRow";
import EditableRow from "./TableRows/EditTableRow";
import TableHead from "../../components/Table/TableHead"; // new
import Pagination from "../../components/Table/Pagination"; // new
import { useSortableTable } from "../../components/Table/useSortableTable"; // new
import { useAuth } from "../../hooks/auth";
import Axios from "axios";
import Loader from "../../utils/Loader";

import { IoMdPersonAdd } from "react-icons/io";
import { MdClose } from "react-icons/md";
import Select from "../../components/Select";

//toast
import { success, warning } from "../../components/Toast";
import { ToastContainer } from "react-toastify";

const TableHeader = [
    {
        id: 1,
        name: "Id",
        accessor: "id",
        sortable: true,
        sortByOrder: "asc",
    },
    {
        id: 2,
        name: "Order Job Number",
        accessor: "order_job_number",
    },
    { id: 3, name: "LA Name", accessor: "LA_name", sortable: true },
    {
        id: 4,
        name: "LV Name",
        accessor: "LV_name",
        sortable: true,
    },
    { id: 5, name: "Commodity", accessor: "commodity", sortable: true },
    { id: 7, name: "Cheque Issue Date", accessor: "chq_issue_date" },
    { id: 9, name: "Part Payment", accessor: "part_pay" },
    { id: 11, name: "Balance", accessor: "balance" },
    { id: 12, name: "Payment", accessor: "payment" },
    { id: 13, name: "Amount", accessor: "amount" },
    { id: 14, name: "Payment Cheque No", accessor: "payment_chq_no" },
    {
        id: 15,
        name: "Payment Cheque Amount",
        accessor: "payment_chq_amount",
        sortable: true,
    },
    {
        id: 16,
        name: "Payment Cheque Date",
        accessor: "payment_chq_date",
        sortable: true,
    },
    { id: 17, name: "Actions" },
];

const App = () => {
    const [PayList, setPayList] = useState([]);
    const [tableData, handleSorting] = useSortableTable(PayList, TableHeader); // data, columns // new
    const [cursorPos, setCursorPos] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [orderJobList, setOrderJobList] = useState([]);

    const { logout } = useAuth();

    // search filter for all fields
    const [query, setQuery] = useState("");

    const data = Object.values(tableData);
    function search(items) {
        if (query !== "" && cursorPos !== 1) {
            setCursorPos(1);
        }
        const res = items.filter((item) =>
            Object.keys(Object.assign({}, ...data)).some((parameter) =>
                item[parameter]?.toString().toLowerCase().includes(query)
            )
        );
        return res.slice(
            (cursorPos - 1) * pageSize,
            (cursorPos - 1) * pageSize + pageSize
        );
    }

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/management/getpayment`)
            .then((res) => res.json())
            .then((data) => {
                setPayList(data);
            });
    }, []);

    // new end

    // add state
    //id is randomly generated with nanoid generator
    const [addFormData, setAddFormData] = useState({
        order_job_number: "",
        LA_name: "",
        LV_name: "",
        commodity: "",
        mode: "",
        chq_issue_date: "",
        chq_amount: "",
        part_pay: "",
        balance: "",
        payment: "",
        amount: "",
        payment_chq_no: "",
        payment_chq_amount: "",
        payment_chq_date: "",
    });

    //edit status
    const [editFormData, setEditFormData] = useState({
        order_job_number: "",
        LA_name: "",
        LV_name: "",
        commodity: "",
        mode: "",
        chq_issue_date: "",
        chq_amount: "",
        part_pay: "",
        balance: "",
        payment: "",
        amount: "",
        payment_chq_no: "",
        payment_chq_amount: "",
        payment_chq_date: "",
    });

    //modified id status
    const [editPayId, setEditPayId] = useState(null);

    //changeHandler
    //Update state with input data
    const handleAddFormChange = (event) => {
        event.preventDefault();

        //fullname, address, phoneNumber, email
        const fieldName = event.target.getAttribute("name");
        //각 input 입력값
        const fieldValue = event.target.value;

        const newFormData = { ...addFormData };
        newFormData[fieldName] = fieldValue;
        //addFormData > event.target(input)
        //fullName:"" > name="fullName", value=fullName input 입력값

        setAddFormData(newFormData);
    };

    //Update status with correction data
    const handleEditFormChange = (event) => {
        event.preventDefault();

        const fieldName = event.target.getAttribute("name");
        const fieldValue = event.target.value;

        const newFormData = { ...editFormData };
        newFormData[fieldName] = fieldValue;

        setEditFormData(newFormData);
    };

    //submit handler
    //Clicking the Add button adds a new data row to the existing row
    const handleAddFormSubmit = (event) => {
        event.preventDefault(); // ???

        //data.json으로 이루어진 기존 행에 새로 입력받은 데이터 행 덧붙이기
        const editedPay = {
            order_job_number: addFormData.order_job_number, //handleAddFormChange로 받은 새 데이터
            LA_name: addFormData.LA_name,
            LV_name: addFormData.LV_name,
            commodity: addFormData.commodity,
            mode: addFormData.mode,
            chq_issue_date: addFormData.chq_issue_date,
            chq_amount: addFormData.chq_amount,
            part_pay: addFormData.part_pay,
            balance: addFormData.balance,
            payment: addFormData.payment,
            amount: addFormData.amount,
            payment_chq_no: addFormData.payment_chq_no,
            payment_chq_amount: addFormData.payment_chq_amount,
            payment_chq_date: addFormData.payment_chq_date,
        };

        //const current = new Date();
        //const order_number_auto = editedPay.importer_name+'-'+current.getDate().toLocaleString()+'-'+editedPay.mother_vessel_name+'-'+editedPay.mv_location
        //console.log(order_number_auto)

        // api call
        Axios.post(
            `${process.env.REACT_APP_API_URL}/management/insertpayment`,
            {
                order_job_number: editedPay.order_job_number, //handleAddFormChange로 받은 새 데이터
                LA_name: editedPay.LA_name,
                LV_name: editedPay.LV_name,
                commodity: editedPay.commodity,
                mode: editedPay.mode,
                chq_issue_date: editedPay.chq_issue_date,
                chq_amount: editedPay.chq_amount,
                part_pay: editedPay.part_pay,
                balance: editedPay.balance,
                payment: editedPay.payment,
                amount: editedPay.amount,
                payment_chq_no: editedPay.payment_chq_no,
                payment_chq_amount: editedPay.payment_chq_amount,
                payment_chq_date: editedPay.payment_chq_date,
            }
        );

        //PayList의 초기값은 data.json 데이터
        // new start
        const newTableData = [...tableData, editedPay];
        // new end

        setPayList(newTableData);

        // close modal
        // closeModal();

        // toast
        success("Pay added successfully");
    };

    //save modified data (App component)
    const handleEditFormSubmit = (event) => {
        event.preventDefault(); // prevent submit

        const editedPay = {
            id: editPayId, //initial value null
            order_job_number: editFormData.order_job_number, //handleAddFormChange로 받은 새 데이터
            LA_name: editFormData.LA_name,
            LV_name: editFormData.LV_name,
            commodity: editFormData.commodity,
            mode: editFormData.mode,
            chq_issue_date: editFormData.chq_issue_date,
            chq_amount: editFormData.chq_amount,
            part_pay: editFormData.part_pay,
            balance: editFormData.balance,
            payment: editFormData.payment,
            amount: editFormData.amount,
            payment_chq_no: editFormData.payment_chq_no,
            payment_chq_amount: editFormData.payment_chq_amount,
            payment_chq_date: editFormData.payment_chq_date,
        };

        Axios.post(
            `${process.env.REACT_APP_API_URL}/management/updatepayment`,
            {
                id: editedPay.id,
                order_job_number: editedPay.order_job_number, //handleAddFormChange로 받은 새 데이터
                LA_name: editedPay.LA_name,
                LV_name: editedPay.LV_name,
                commodity: editedPay.commodity,
                mode: editedPay.mode,
                chq_issue_date: editedPay.chq_issue_date,
                chq_amount: editedPay.chq_amount,
                part_pay: editedPay.part_pay,
                balance: editedPay.balance,
                payment: editedPay.payment,
                amount: editedPay.amount,
                payment_chq_no: editedPay.payment_chq_no,
                payment_chq_amount: editedPay.payment_chq_amount,
                payment_chq_date: editedPay.payment_chq_date,
            }
        );

        // these 3 lines will be replaced // new start
        const index = tableData.findIndex((td) => td.id === editPayId);
        tableData[index] = editedPay;
        setPayList(tableData);
        // new end

        setEditPayId(null);
        success("Pay updated successfully");
    };

    //Read-only data If you click the edit button, the existing data is displayed
    const handleEditClick = (event, Pay) => {
        event.preventDefault(); // ???

        setEditPayId(Pay.id);
        const formValues = {
            order_job_number: Pay.order_job_number, //handleAddFormChange로 받은 새 데이터
            LA_name: Pay.LA_name,
            LV_name: Pay.LV_name,
            commodity: Pay.commodity,
            mode: Pay.mode,
            chq_issue_date: Pay.chq_issue_date,
            chq_amount: Pay.chq_amount,
            part_pay: Pay.part_pay,
            balance: Pay.balance,
            payment: Pay.payment,
            amount: Pay.amount,
            payment_chq_no: Pay.payment_chq_no,
            payment_chq_amount: Pay.payment_chq_amount,
            payment_chq_date: Pay.payment_chq_date,
        };
        setEditFormData(formValues);
    };

    //Cancel button when clicked on edit
    const handleCancelClick = () => {
        setEditPayId(null);
    };

    // delete
    const handleDeleteClick = (PayId) => {
        const editedPayList = [...PayList];
        const index = PayList.findIndex((Pay) => Pay.id === PayId);
        //console.log("Deleting Pay with id: " + PayId);
        Axios.post(
            `${process.env.REACT_APP_API_URL}/management/deletepayment`,
            {
                Pay_id: PayId,
            }
        ).then((response) => {
            if (response.data == "success") {
                success("Pay deleted successfully");
            }
        });

        editedPayList.splice(index, 1);
        setPayList(editedPayList);
    };

    const filteredPay =
        query === ""
            ? PayList
            : PayList.filter((Pay) =>
                  Pay.order_number
                      .toLowerCase()
                      .replace(/\s+/g, "")
                      .includes(query.toLowerCase().replace(/\s+/g, ""))
              );

    // modal for add Pay
    // let [isOpen, setIsOpen] = useState(false);

    // function closeModal() {
    //     setIsOpen(false);
    // }

    // function openModal() {
    //     setIsOpen(true);
    // }

    //If save(submit) is pressed after editing is completed, submit > handleEditFormSubmit action
    return (
        <div className="m-2 mt-4">
            {/* // new start */}
            <div className="my-2 mx-auto flex justify-center">
                <Pagination
                    pageSize={pageSize}
                    cursorPos={cursorPos}
                    setCursorPos={setCursorPos}
                    rowsCount={data.length}
                />
                <input
                    className="mx-auto block w-1/2 rounded-md border-2 border-slate-300 bg-white py-2 shadow-lg placeholder:italic placeholder:text-slate-500 focus:border-green-500 focus:ring-0 sm:text-sm"
                    placeholder="Search for anything..."
                    type="search"
                    name="search"
                    onChange={(event) => setQuery(event.target.value)}
                />
                {/* <button
                    // new start // job change copy paste the className
                    className="flex flex-row items-center justify-center rounded-md bg-green-600 px-3 py-0 text-sm font-semibold text-white transition duration-500 ease-in-out hover:bg-green-400"
                    onClick={openModal}
                >
                    Add Payment{" "}
                    <IoMdPersonAdd className="ml-2 inline h-5 w-5" />
                </button> */}
            </div>
            <form onSubmit={handleEditFormSubmit}>
                <table className="table">
                    <TableHead
                        columns={TableHeader}
                        handleSorting={handleSorting}
                    />
                    {search(tableData).length === 0 && query !== "" ? (
                        <div className="py-2 px-4 text-gray-700">
                            Nothing found.
                        </div>
                    ) : (
                        <tbody className="divide-y divide-gray-100 rounded-md">
                            {search(tableData).map((Pay, idx) => (
                                <tr
                                    key={Pay.id}
                                    className={`my-auto items-center justify-center ${
                                        idx % 2 === 1 ? "bg-gray-200" : ""
                                    }`}
                                >
                                    {editPayId === Pay.id ? (
                                        <EditableRow
                                            editFormData={editFormData}
                                            handleEditFormChange={
                                                handleEditFormChange
                                            }
                                            handleCancelClick={
                                                handleCancelClick
                                            }
                                        />
                                    ) : (
                                        <ReadOnlyRow
                                            Pay={Pay}
                                            handleEditClick={handleEditClick}
                                            handleDeleteClick={
                                                handleDeleteClick
                                            }
                                        />
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </form>

            {/* // new end */}

            {/* add item modal */}
            {/* <Suspense fallback={<Loader />}>
                <Transition appear show={isOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="z-10 overflow-y-auto"
                        // new start
                        onClose={() => {}}
                        // new end
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                        <Dialog.Title
                                            as="h3"
                                            className="mb-4 text-left text-3xl font-medium text-gray-900"
                                        >
                                            Add Payment
                                            <button
                                                className="float-right"
                                                onClick={closeModal}
                                            >
                                                <MdClose className="inline text-red-600" />
                                            </button>
                                        </Dialog.Title>
                                        <form
                                            onSubmit={handleAddFormSubmit}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="group relative w-72 md:w-80 lg:w-96">
                                                <label className="block w-full pb-1 text-sm font-medium text-gray-500 transition-all duration-200 ease-in-out group-focus-within:text-blue-400">
                                                    Order Job Number
                                                </label>
                                                {orderJobList && (
                                                    <Select
                                                        options={orderJobList}
                                                        name="order_job_number"
                                                        addFormData={
                                                            addFormData
                                                        }
                                                        setAddFormData={
                                                            setAddFormData
                                                        }
                                                        isAddFromData={true}
                                                    />
                                                )}
                                            </div>
                                            <div className="group relative w-72 md:w-80 lg:w-96">
                                                <label className="block w-full pb-1 text-sm font-medium text-gray-500 transition-all duration-200 ease-in-out group-focus-within:text-blue-400">
                                                    Chq No
                                                </label>
                                                <input
                                                    type="number"
                                                    name="chq_no"
                                                    onChange={
                                                        handleAddFormChange
                                                    }
                                                    required
                                                    className="peer h-10 w-full rounded-md bg-gray-50 px-4 outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:ring-2 focus:ring-blue-400"
                                                />
                                            </div>
                                            <div className="group relative w-72 md:w-80 lg:w-96">
                                                <label className="block w-full pb-1 text-sm font-medium text-gray-500 transition-all duration-200 ease-in-out group-focus-within:text-blue-400">
                                                    Amount
                                                </label>
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    onChange={
                                                        handleAddFormChange
                                                    }
                                                    required
                                                    className="peer h-10 w-full rounded-md bg-gray-50 px-4 outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:ring-2 focus:ring-blue-400"
                                                />
                                            </div>
                                            <div className="group relative w-72 md:w-80 lg:w-96">
                                                <label className="block w-full pb-1 text-sm font-medium text-gray-500 transition-all duration-200 ease-in-out group-focus-within:text-blue-400">
                                                    Payment Approved
                                                </label>
                                                <input
                                                    type="number"
                                                    name="payment_approved"
                                                    onChange={
                                                        handleAddFormChange
                                                    }
                                                    required
                                                    className="peer h-10 w-full rounded-md bg-gray-50 px-4 outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:ring-2 focus:ring-blue-400"
                                                />
                                            </div>
                                            <div className="group relative w-72 md:w-80 lg:w-96">
                                                <label className="block w-full pb-1 text-sm font-medium text-gray-500 transition-all duration-200 ease-in-out group-focus-within:text-blue-400">
                                                    Payment Chq No
                                                </label>
                                                <input
                                                    type="number"
                                                    name="payment_chq_no"
                                                    onChange={
                                                        handleAddFormChange
                                                    }
                                                    className="peer h-10 w-full rounded-md bg-gray-50 px-4 outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:ring-2 focus:ring-blue-400"
                                                />
                                            </div>
                                            <div className="group relative w-72 md:w-80 lg:w-96">
                                                <label className="block w-full pb-1 text-sm font-medium text-gray-500 transition-all duration-200 ease-in-out group-focus-within:text-blue-400">
                                                    Payment Chq Amount
                                                </label>
                                                <input
                                                    type="number"
                                                    name="payment_chq_amount"
                                                    onChange={
                                                        handleAddFormChange
                                                    }
                                                    className="peer h-10 w-full rounded-md bg-gray-50 px-4 outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:ring-2 focus:ring-blue-400"
                                                />
                                            </div>
                                            <div className="group relative w-72 md:w-80 lg:w-96">
                                                <label className="block w-full pb-1 text-sm font-medium text-gray-500 transition-all duration-200 ease-in-out group-focus-within:text-blue-400">
                                                    Payment Chq Date
                                                </label>
                                                <input
                                                    type="date"
                                                    name="payment_chq_date"
                                                    onChange={
                                                        handleAddFormChange
                                                    }
                                                    className="peer h-10 w-full rounded-md bg-gray-50 px-4 outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:ring-2 focus:ring-blue-400"
                                                />
                                            </div>
                                            <div className="group relative w-72 md:w-80 lg:w-96">
                                                <label className="block w-full pb-1 text-sm font-medium text-gray-500 transition-all duration-200 ease-in-out group-focus-within:text-blue-400">
                                                    Added Date
                                                </label>
                                                <input
                                                    type="date"
                                                    name="added_date"
                                                    onChange={
                                                        handleAddFormChange
                                                    }
                                                    className="peer h-10 w-full rounded-md bg-gray-50 px-4 outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-white focus:ring-2 focus:ring-blue-400"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-green-300 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                                            >
                                                Add
                                            </button>
                                        </form>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </Suspense> */}

            {/* toast  */}
            <ToastContainer closeOnClick />
        </div>
    );
};

export default App;
